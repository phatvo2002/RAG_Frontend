import type { MeetingTranscriptSegment } from '@/api/meetings.api';

export interface TranscriptEvent extends MeetingTranscriptSegment {
  type: 'partial' | 'final';
  sequence?: number;
  receivedAt?: number;
}

export const normalizeParticipantId = (id: string) => id.replaceAll('-', '').toLowerCase();

export function mergeTranscriptEvent(current: TranscriptEvent | undefined, incoming: TranscriptEvent, now: number): TranscriptEvent {
  if (current) {
    if (current.type === 'final' && incoming.type === 'partial') return current;
    if (current.type === incoming.type && (incoming.sequence ?? 0) <= (current.sequence ?? 0)) return current;
  }
  return { ...incoming, receivedAt: now };
}

export function activeCaptions(events: TranscriptEvent[], now: number): Map<string, TranscriptEvent> {
  const captions = new Map<string, TranscriptEvent>();
  for (const event of events) {
    if (event.receivedAt === undefined || now - event.receivedAt > (event.type === 'partial' ? 6000 : 5000)) continue;
    const speaker = normalizeParticipantId(event.speakerUserId);
    const current = captions.get(speaker);
    if (!current || event.receivedAt >= (current.receivedAt ?? 0)) captions.set(speaker, event);
  }
  return captions;
}

export function captionForTile(captions: Map<string, TranscriptEvent>, participantIdentity: string, isCamera: boolean): TranscriptEvent | undefined {
  return isCamera ? captions.get(normalizeParticipantId(participantIdentity)) : undefined;
}
