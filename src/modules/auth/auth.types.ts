export type GoogleAuthInput = {
  credential: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
};
