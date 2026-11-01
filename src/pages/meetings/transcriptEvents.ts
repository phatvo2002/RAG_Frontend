import type { MeetingTranscriptSegment } from '@/api/meetings.api';

export interface TranscriptEvent extends MeetingTranscriptSegment {
  type: 'partial' | 'final';
  sequence?: number;
  receivedAt?: number;
}

export interface TranslationEvent {
  type: 'translation';
  segmentId: string;
  targetLanguage: 'vi' | 'en';
  text: string;
  receivedAt?: number;
}

export type MeetingStreamEvent = TranscriptEvent | TranslationEvent;

export interface DisplayTranscriptEvent extends TranscriptEvent {
  displayText: string;
  translated: boolean;
  translating: boolean;
  translationUnavailable: boolean;
}

export const normalizeParticipantId = (id: string) => id.replaceAll('-', '').toLowerCase();

export function mergeTranscriptEvent(current: TranscriptEvent | undefined, incoming: TranscriptEvent, now: number): TranscriptEvent {
  if (current) {
    if (current.type === 'final' && incoming.type === 'partial') return current;
    if (current.type === incoming.type && (incoming.sequence ?? 0) <= (current.sequence ?? 0)) return current;
  }
  return { ...incoming, receivedAt: now };
}

export function displayTranscriptEvent(event: TranscriptEvent, target: 'vi' | 'en',
  translation?: TranslationEvent, now = Date.now()): DisplayTranscriptEvent {
  const translated = event.type === 'final' && event.sourceLanguage !== target &&
    translation?.targetLanguage === target && !!translation.text;
  return {
    ...event,
    displayText: translated ? translation.text : event.text,
    translated: !!translated,
    translating: !translated && event.type === 'final' && event.sourceLanguage !== target &&
      event.receivedAt !== undefined && now - event.receivedAt < 30000,
    translationUnavailable: !translated && event.type === 'final' && event.sourceLanguage !== target &&
      event.receivedAt !== undefined && now - event.receivedAt >= 30000,
    receivedAt: translated ? translation.receivedAt : event.receivedAt,
  };
}

export function activeCaptions(events: TranscriptEvent[], now: number,
  target?: 'vi' | 'en', translations: Record<string, TranslationEvent> = {}): Map<string, DisplayTranscriptEvent> {
  const captions = new Map<string, DisplayTranscriptEvent>();
  for (const event of events) {
    const display = displayTranscriptEvent(event, target ?? event.sourceLanguage, translations[event.segmentId], now);
    if (event.type === 'final' && event.receivedAt !== undefined && now - event.receivedAt > 15000) continue;
    if (display.receivedAt === undefined || now - display.receivedAt > (event.type === 'partial' ? 6000 : 5000)) continue;
    const speaker = normalizeParticipantId(event.speakerUserId);
    const current = captions.get(speaker);
    if (!current || display.startedAt > current.startedAt ||
      (display.startedAt === current.startedAt && display.receivedAt >= (current.receivedAt ?? 0))) captions.set(speaker, display);
  }
  return captions;
}

export function captionForTile(captions: Map<string, DisplayTranscriptEvent>, participantIdentity: string, isCamera: boolean): DisplayTranscriptEvent | undefined {
  return isCamera ? captions.get(normalizeParticipantId(participantIdentity)) : undefined;
}
