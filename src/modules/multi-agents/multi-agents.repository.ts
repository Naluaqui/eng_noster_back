import { findMeetingById } from '../meetings/meetings.repository';
import type { AnalysisMeeting } from './multi-agents.types';

export async function findMeetingsForAnalysis(meetingIds: string[], companyId?: string) {
  const meetings = await Promise.all(meetingIds.map((meetingId) => findMeetingById(meetingId, companyId)));

  return meetings.filter((meeting): meeting is AnalysisMeeting => Boolean(meeting));
}
