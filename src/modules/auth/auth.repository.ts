import type { AuthUser } from './auth.types';

const users: AuthUser[] = [];

export async function findUserByEmail(email: string) {
  return users.find((user) => user.email === email) ?? null;
}

export async function createUser(user: Omit<AuthUser, 'id'>) {
  const newUser: AuthUser = {
    id: crypto.randomUUID(),
    ...user,
  };

  users.push(newUser);

  return newUser;
}
