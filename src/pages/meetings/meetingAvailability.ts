import { useEffect, useState } from 'react';
import type { OnlineMeeting } from '@/api/meetings.api';

export function isScheduledMeetingExpired(meeting: OnlineMeeting, now: number): boolean {
  return meeting.status === 'Scheduled' && Date.parse(meeting.scheduledEnd) <= now;
}

export function useMeetingClock(): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
