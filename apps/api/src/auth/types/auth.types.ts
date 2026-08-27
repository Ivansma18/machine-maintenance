export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  name: string;
};

export type AuthenticatedIdentity = {
  user: AuthenticatedUser;
  roles: string[];
  permissions: string[];
  scopes: { level: 'SITE' | 'AREA'; siteId: string | null; areaId: string | null }[];
  sessionId: string;
};

export type AuthenticatedSession = {
  token: string;
  identity: AuthenticatedIdentity;
};
