import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CarouselLayout, Chat, ConnectionStateToast, ControlBar, FocusLayoutContainer, GridLayout,
  LayoutContextProvider, RoomAudioRenderer, useCreateLayoutContext, usePinnedTracks, useTracks,
} from '@livekit/components-react';
import { isEqualTrackRef, isTrackReference } from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import type { MeetingUserOption } from '@/api/meetings.api';
import type { TranscriptEvent } from './transcriptEvents';
import { CaptionedParticipantTile } from './CaptionedParticipantTile';

export const MeetingVideoConference: React.FC<{
  captions: Map<string, TranscriptEvent>;
  captionsEnabled: boolean;
  onToggleCaptions: () => void;
  participants: MeetingUserOption[];
  language: string;
}> = ({ captions, captionsEnabled, onToggleCaptions, participants, language }) => {
  const [showChat, setShowChat] = useState(false);
  const layout = useCreateLayoutContext();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ], { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged], onlySubscribed: false });
  const focusTrack = usePinnedTracks(layout)?.[0];
  const screenShareTracks = useMemo(() => tracks.filter(isTrackReference)
    .filter(track => track.publication.source === Track.Source.ScreenShare), [tracks]);
  const carouselTracks = tracks.filter(track => !isEqualTrackRef(track, focusTrack));
  const autoFocused = useRef<string | null>(null);

  useEffect(() => {
    const screenShare = screenShareTracks.find(track => track.publication.isSubscribed);
    if (screenShare && autoFocused.current === null) {
      layout.pin.dispatch?.({ msg: 'set_pin', trackReference: screenShare });
      autoFocused.current = screenShare.publication.trackSid;
    } else if (autoFocused.current && !screenShareTracks.some(track => track.publication.trackSid === autoFocused.current)) {
      layout.pin.dispatch?.({ msg: 'clear_pin' });
      autoFocused.current = null;
    }
    if (focusTrack && !isTrackReference(focusTrack)) {
      const updated = tracks.find(track => track.participant.identity === focusTrack.participant.identity &&
        track.source === focusTrack.source);
      if (updated && updated !== focusTrack && isTrackReference(updated)) {
        layout.pin.dispatch?.({ msg: 'set_pin', trackReference: updated });
      }
    }
  }, [screenShareTracks, focusTrack, tracks, layout.pin]);

  const tile = <CaptionedParticipantTile captions={captions} participants={participants} language={language} />;
  const label = language === 'vi' ? 'Phụ đề' : 'Captions';
  return <div className="lk-video-conference">
    <LayoutContextProvider value={layout} onWidgetChange={state => setShowChat(state.showChat)}>
      <div className="lk-video-conference-inner">
        <button type="button" aria-pressed={captionsEnabled} onClick={onToggleCaptions}
          className="absolute left-3 top-3 z-20 rounded bg-black/75 px-3 py-1.5 text-sm font-medium text-white hover:bg-black/90">
          {label}: {captionsEnabled ? (language === 'vi' ? 'Bật' : 'On') : (language === 'vi' ? 'Tắt' : 'Off')}
        </button>
        {!focusTrack ? <div className="lk-grid-layout-wrapper">
          <GridLayout tracks={tracks}>{tile}</GridLayout>
        </div> : <div className="lk-focus-layout-wrapper">
          <FocusLayoutContainer>
            <CarouselLayout tracks={carouselTracks}>{tile}</CarouselLayout>
            <CaptionedParticipantTile trackRef={focusTrack} captions={captions} participants={participants} language={language} />
          </FocusLayoutContainer>
        </div>}
        <ControlBar controls={{ chat: true }} />
      </div>
      <Chat style={{ display: showChat ? 'grid' : 'none' }} />
    </LayoutContextProvider>
    <RoomAudioRenderer />
    <ConnectionStateToast />
  </div>;
};
