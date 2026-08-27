export type AuthenticatedUser = {
  id: string;
  username: string;
  email: string;
  name: string;
};

export type AuthIdentity = {
  user: AuthenticatedUser;
  roles: string[];
  permissions: string[];
  scopes: { level: 'SITE' | 'AREA'; siteId: string | null; areaId: string | null }[];
};
