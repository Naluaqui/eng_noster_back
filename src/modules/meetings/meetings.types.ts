export type MeetingStatus = 'scheduled' | 'in-review' | 'decided';

export type Meeting = {
  id: string;
  title: string;
  date: string;
  participants: string[];
  status: MeetingStatus;
  summary: string;
  owner: string;
  tags: string[];
  signalCount: number;
};

export type UpdateMeetingStatusInput = {
  status: MeetingStatus;
};
