export type MeetingStatus = 'scheduled' | 'in-review' | 'decided' | 'analyzed';

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
  transcription?: string;
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
  transcription?: string;
  notes?: string;
};

export type UpdateMeetingInput = CreateMeetingInput;
