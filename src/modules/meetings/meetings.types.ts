export type MeetingStatus = 'scheduled' | 'in-review' | 'decided';

export type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  participants: string[];
  status: MeetingStatus;
  summary: string;
  owner: string;
  tags: string[];
  signalCount: number;
  product?: string;
  description?: string;
  notes?: string;
};

export type UpdateMeetingStatusInput = {
  status: MeetingStatus;
};

export type CreateMeetingInput = {
  title: string;
  date: string;
  time: string;
  participants?: string[];
  product?: string;
  description?: string;
  notes?: string;
};

export type UpdateMeetingInput = CreateMeetingInput;
