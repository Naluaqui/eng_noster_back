import { Router } from 'express';
import {
  getMeetingController,
  listMeetingsController,
  updateMeetingStatusController,
} from './meetings.controller';

export const meetingsRoutes = Router();

meetingsRoutes.get('/', listMeetingsController);
meetingsRoutes.get('/:meetingId', getMeetingController);
meetingsRoutes.patch('/:meetingId/status', updateMeetingStatusController);
