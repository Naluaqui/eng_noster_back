import { prisma } from '../../infra/database/prisma.client';
import type { AuthUser } from './auth.types';

type CreateAuthUserInput = Omit<AuthUser, 'id'> & {
  googleId?: string;
};

function mapUserToAuthUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user ? mapUserToAuthUser(user) : null;
}

export async function createUser(user: CreateAuthUserInput) {
  const createdUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      memberships: {
        create: {
          role: 'owner',
          company: {
            create: {
              name: `${user.name} Workspace`,
            },
          },
        },
      },
    },
  });

  return mapUserToAuthUser(createdUser);
}
