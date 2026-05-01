import { Router } from 'express';
import { prisma } from '../../infra/database/prisma.client';

export const databaseTestRoutes = Router();

databaseTestRoutes.get('/', async (_request, response) => {
  const usersCount = await prisma.user.count();
  const companiesCount = await prisma.company.count();
  const meetingsCount = await prisma.meeting.count();

  return response.status(200).json({
    success: true,
    database: 'connected',
    usersCount,
    companiesCount,
    meetingsCount,
  });
});
