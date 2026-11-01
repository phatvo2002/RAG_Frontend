import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/pages/meetings/transcriptEvents.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { module, exports: module.exports });
const { mergeTranscriptEvent, activeCaptions, captionForTile, displayTranscriptEvent } = module.exports;
const segment = {
  segmentId: 'segment-1', speakerUserId: '12345678-1234-1234-1234-123456789abc',
  startedAt: '2026-01-01T00:00:00Z', endedAt: '2026-01-01T00:00:02Z',
  sourceLanguage: 'vi', text: 'Xin', type: 'partial', sequence: 100
};

test('newer partial replaces older text and final cannot be overwritten', () => {
  const first = mergeTranscriptEvent(undefined, segment, 1000);
  const newer = mergeTranscriptEvent(first, { ...segment, text: 'Xin chào', sequence: 200 }, 2000);
  assert.equal(newer.text, 'Xin chào');
  assert.equal(mergeTranscriptEvent(newer, segment, 3000), newer);
  const final = mergeTranscriptEvent(newer, { ...segment, type: 'final', text: 'Xin chào bạn', sequence: 250 }, 4000);
  assert.equal(final.type, 'final');
  assert.equal(mergeTranscriptEvent(final, { ...segment, sequence: 300 }, 5000), final);
});

test('caption belongs to the camera or placeholder of the matching speaker and expires', () => {
  const event = mergeTranscriptEvent(undefined, segment, 1000);
  const other = mergeTranscriptEvent(undefined, { ...segment, segmentId: 'segment-2', speakerUserId: 'other', text: 'Hello' }, 1500);
  const captions = activeCaptions([event, other], 2000);
  assert.equal(captionForTile(captions, '12345678123412341234123456789abc', true)?.text, 'Xin');
  assert.equal(captionForTile(captions, 'other', true)?.text, 'Hello');
  assert.equal(captionForTile(captions, '12345678123412341234123456789abc', false), undefined);
  assert.equal(captionForTile(captions, 'unknown', true), undefined);
  assert.equal(activeCaptions([event], 8000).size, 0);
});

test('translation appears only for matching target language and refreshes the caption', () => {
  const original = mergeTranscriptEvent(undefined, { ...segment, type: 'final', text: 'Hello', sourceLanguage: 'en' }, 1000);
  const translation = { type: 'translation', segmentId: 'segment-1', targetLanguage: 'vi', text: 'Xin chào', receivedAt: 7000 };
  const translated = displayTranscriptEvent(original, 'vi', translation, 8000);
  assert.equal(translated.displayText, 'Xin chào');
  assert.equal(translated.text, 'Hello');
  assert.equal(translated.translated, true);
  assert.equal(displayTranscriptEvent(original, 'en', translation, 8000).displayText, 'Hello');
  const captions = activeCaptions([original], 8000, 'vi', { 'segment-1': translation });
  assert.equal(captionForTile(captions, segment.speakerUserId, true)?.displayText, 'Xin chào');
});

test('late translation from an older turn does not cover newer speech', () => {
  const old = mergeTranscriptEvent(undefined, { ...segment, type: 'final', text: 'Hello', sourceLanguage: 'en' }, 1000);
  const current = mergeTranscriptEvent(undefined, {
    ...segment, segmentId: 'segment-2', startedAt: '2026-01-01T00:00:05Z', text: 'Next', sourceLanguage: 'en'
  }, 7000);
  const translation = { type: 'translation', segmentId: 'segment-1', targetLanguage: 'vi', text: 'Xin chào', receivedAt: 7500 };
  const captions = activeCaptions([old, current], 8000, 'vi', { 'segment-1': translation });
  assert.equal(captionForTile(captions, segment.speakerUserId, true)?.displayText, 'Next');
});

test('caption renders over the speaker camera but not screen share', () => {
  const tileSource = readFileSync(new URL('../src/pages/meetings/CaptionedParticipantTile.tsx', import.meta.url), 'utf8');
  const tileModule = { exports: {} };
  const tileCompiled = ts.transpileModule(tileSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  vm.runInNewContext(tileCompiled, {
    module: tileModule, exports: tileModule.exports,
    require: (name) => {
      if (name === '@livekit/components-react') return {
        ParticipantTile: () => React.createElement('div', { className: 'video-tile' }),
        useMaybeTrackRefContext: () => undefined
      };
      if (name === 'livekit-client') return { Track: { Source: { Camera: 'camera' } } };
      if (name === './transcriptEvents') return module.exports;
      return require(name);
    }
  });
  const caption = mergeTranscriptEvent(undefined, segment, 1000);
  const captions = activeCaptions([caption], 2000);
  const props = { captions, participants: [{ id: segment.speakerUserId, displayName: 'An' }], language: 'vi' };
  const camera = renderToStaticMarkup(React.createElement(tileModule.exports.CaptionedParticipantTile, {
    ...props, trackRef: { participant: { identity: '12345678123412341234123456789abc' }, source: 'camera' }
  }));
  assert.match(camera, /An:/);
  assert.match(camera, /Xin/);
  const share = renderToStaticMarkup(React.createElement(tileModule.exports.CaptionedParticipantTile, {
    ...props, trackRef: { participant: { identity: '12345678123412341234123456789abc' }, source: 'screen_share' }
  }));
  assert.doesNotMatch(share, /Xin/);
});
