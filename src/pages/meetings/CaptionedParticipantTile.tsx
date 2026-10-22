import React from 'react';
import { ParticipantTile, useMaybeTrackRefContext, type TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { MeetingUserOption } from '@/api/meetings.api';
import { captionForTile, normalizeParticipantId, type TranscriptEvent } from './transcriptEvents';

export const CaptionedParticipantTile: React.FC<{
  trackRef?: TrackReferenceOrPlaceholder;
  captions: Map<string, TranscriptEvent>;
  participants: MeetingUserOption[];
  language: string;
}> = ({ trackRef, captions, participants, language }) => {
  const contextTrack = useMaybeTrackRefContext();
  const track = trackRef ?? contextTrack;
  if (!track) return null;
  const speaker = normalizeParticipantId(track.participant.identity);
  const caption = captionForTile(captions, track.participant.identity, track.source === Track.Source.Camera);
  const name = participants.find(person => normalizeParticipantId(person.id) === speaker)?.displayName
    ?? (language === 'vi' ? 'Người tham gia' : 'Participant');

  return <div className="relative h-full min-h-0 min-w-0 overflow-hidden">
    <ParticipantTile trackRef={track} className="h-full w-full" />
    {caption && <div className="pointer-events-none absolute inset-x-2 bottom-10 z-10 flex justify-center sm:inset-x-4" aria-live="polite">
      <div className="max-w-full rounded bg-black/80 px-2 py-1 text-center text-sm leading-snug text-white shadow-lg sm:text-base">
        <span className="break-words" style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
          <strong>{name}: </strong>{caption.text}
        </span>
      </div>
    </div>}
  </div>;
};
