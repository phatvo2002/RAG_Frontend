import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/pages/data-repo/DocumentProcessingProgress.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 }
}).outputText;
const module = { exports: {} };
let result;
let options;
vm.runInNewContext(compiled, {
  module,
  exports: module.exports,
  require: (name) => {
    if (name === '@tanstack/react-query') return { useQuery: (value) => { options = value; return result; } };
    if (name === '@/api/documents.api') return {
      documentsApi: { getProgress: async () => result.data },
      documentsQueryKeys: { progress: () => ['documents', 'progress'] }
    };
    if (name === '@/context/AppContext') return { useApp: () => ({ language: 'en' }) };
    return require(name);
  }
});
const { DocumentProcessingProgress } = module.exports;
const base = {
  documentId: 'd', versionId: 'v', fileName: 'report.pdf', provider: 'Gemini',
  indexedChunks: 0, totalChunks: 0, waitingForQuota: false, reindexing: false,
  processingStatus: 'QUEUED', indexStatus: null, failureCode: null
};
const render = (items, documentId) => {
  result = { data: items, isLoading: false, isError: false, refetch: () => {} };
  return renderToStaticMarkup(React.createElement(DocumentProcessingProgress, { enabled: true, documentId }));
};

test('shows stage before chunk count and polls while queued', () => {
  const html = render([base]);
  assert.match(html, /Queued/);
  assert.doesNotMatch(html, /role="progressbar"/);
  assert.doesNotMatch(html, /\d+%/);
  assert.equal(options.refetchInterval({ state: { data: [base] } }), 5000);
});

test('shows quota wait and indexed count during processing', () => {
  const item = { ...base, processingStatus: 'INDEXING', totalChunks: 10, indexedChunks: 2, waitingForQuota: true };
  const html = render([item]);
  assert.match(html, /Waiting for embedding quota/);
  assert.match(html, /2\/10 chunk/);
  assert.match(html, />20%<\/span>/);
  assert.match(html, /role="progressbar"[^>]*aria-valuenow="20"/);
  assert.match(html, /width:20%/);
});

test('shows OpenAI reindexing and stops polling at completion or failure', () => {
  const reindexing = { ...base, provider: 'OpenAI', processingStatus: 'READY', totalChunks: 10, indexedChunks: 4, reindexing: true, indexStatus: 'BUILDING' };
  assert.match(render([reindexing]), /Reindexing with OpenAI/);
  assert.equal(options.refetchInterval({ state: { data: [reindexing] } }), 5000);
  const completed = { ...reindexing, indexedChunks: 10, reindexing: false, indexStatus: 'ACTIVE' };
  assert.match(render([completed]), /Completed/);
  assert.equal(options.refetchInterval({ state: { data: [completed] } }), false);
  const failed = { ...base, processingStatus: 'FAILED', failureCode: 'PROCESSING_FAILED' };
  assert.match(render([failed]), /Processing failed/);
  assert.equal(options.refetchInterval({ state: { data: [failed] } }), false);
});

test('stops requesting progress when modal closes', () => {
  result = { data: [base], isLoading: false, isError: false, refetch: () => {} };
  renderToStaticMarkup(React.createElement(DocumentProcessingProgress, { enabled: false }));
  assert.equal(options.enabled, false);
  assert.equal(options.refetchInterval({ state: { data: [base] } }), false);
});

test('shows only the selected document and polls its progress', () => {
  const other = { ...base, documentId: 'other', versionId: 'other-version', fileName: 'other.pdf', processingStatus: 'INDEXING', totalChunks: 10 };
  const selected = { ...base, documentId: 'selected', versionId: 'selected-version', fileName: 'selected.pdf', processingStatus: 'READY', indexStatus: 'ACTIVE', totalChunks: 10, indexedChunks: 10 };
  const html = render([other, selected], 'selected');
  assert.match(html, /selected\.pdf/);
  assert.doesNotMatch(html, /other\.pdf/);
  assert.equal(options.refetchInterval({ state: { data: [other, selected] } }), false);
  assert.match(render([other], 'selected'), /No processing progress available/);
});
