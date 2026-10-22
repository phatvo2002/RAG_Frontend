import React, { useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import type { MeetingUserOption } from '@/api/meetings.api';
import type { TranscriptEvent } from './transcriptEvents';
export type { TranscriptEvent } from './transcriptEvents';

const TOPIC = 'nexora.meeting.transcript.v1';

export const TranscriptStreamListener: React.FC<{
  meetingId: string;
  onEvent: (event: TranscriptEvent) => void;
  onAvailability: (available: boolean) => void;
}> = ({ meetingId, onEvent, onAvailability }) => {
  const room = useRoomContext();
  useEffect(() => {
    const identity = `transcript-agent-${meetingId.replaceAll('-', '').toLowerCase()}`;
    const handler = (payload: Uint8Array, sender?: { identity: string }, _kind?: unknown, topic?: string) => {
      try {
        if (topic !== TOPIC || sender?.identity !== identity) return;
        const event = JSON.parse(new TextDecoder().decode(payload)) as TranscriptEvent;
        if (event.segmentId && event.speakerUserId && (event.type === 'partial' || event.type === 'final')) onEvent(event);
      } catch { /* A malformed packet is recovered from the stored transcript. */ }
    };
    room.on(RoomEvent.DataReceived, handler);
    const updateAvailability = () => onAvailability(room.remoteParticipants.has(identity));
    updateAvailability();
    room.on(RoomEvent.ParticipantConnected, updateAvailability);
    room.on(RoomEvent.ParticipantDisconnected, updateAvailability);
    return () => {
      room.off(RoomEvent.DataReceived, handler);
      room.off(RoomEvent.ParticipantConnected, updateAvailability);
      room.off(RoomEvent.ParticipantDisconnected, updateAvailability);
    };
  }, [room, meetingId, onEvent, onAvailability]);
  return null;
};

export const TranscriptPanel: React.FC<{
  segments: TranscriptEvent[];
  participants: MeetingUserOption[];
  language: string;
  unavailable: boolean;
}> = ({ segments, participants, language, unavailable }) => {
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const names = new Map(participants.map(person => [person.id.replaceAll('-', '').toLowerCase(), person.displayName]));
  return <section className="flex h-full min-h-[220px] flex-col rounded-xl border border-[#dce5f3] bg-white p-4 dark:border-[#223149] dark:bg-[#111b2c]">
    <h2 className="text-lg font-semibold">{tr('Transcript', 'Phụ đề cuộc họp')}</h2>
    {unavailable && <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">{tr('Live captions are unavailable. Saved transcript remains visible.', 'Phụ đề trực tiếp chưa sẵn sàng. Các đoạn đã lưu vẫn hiển thị.')}</p>}
    <div aria-live="polite" className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
      {segments.length === 0 && <p className="text-sm text-[#60738e]">{tr('No speech transcribed yet.', 'Chưa có lời nói được nhận dạng.')}</p>}
      {segments.map(segment => <div key={segment.segmentId} className="text-sm">
        <div className="font-medium">{names.get(segment.speakerUserId.replaceAll('-', '').toLowerCase()) ?? tr('Participant', 'Người tham gia')}
          <span className="ml-2 font-normal text-[#60738e]">{new Date(segment.startedAt).toLocaleTimeString()} · {segment.sourceLanguage.toUpperCase()}</span>
        </div>
        <p className={segment.type === 'partial' ? 'text-[#60738e]' : ''}>{segment.text}</p>
      </div>)}
    </div>
  </section>;
};
