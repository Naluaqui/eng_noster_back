import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { meetingsRoutes } from './modules/meetings/meetings.routes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/meetings', meetingsRoutes);
