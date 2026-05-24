import { Router } from 'express';
import { authRoutes } from './modules/auth/auth.routes';
import { databaseTestRoutes } from './modules/database-test/database-test.routes';
import { meetingsRoutes } from './modules/meetings/meetings.routes';
import { multiAgentsRoutes } from './modules/multi-agents/multi-agents.routes';
import { settingsRoutes } from './modules/settings/settings.routes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/database-test', databaseTestRoutes);
routes.use('/meetings', meetingsRoutes);
routes.use('/multi-agents', multiAgentsRoutes);
routes.use('/settings', settingsRoutes);
