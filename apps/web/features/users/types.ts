export type UserRole = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
};
export type ManagedUser = {
  id: string;
  username: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  roles: UserRole[];
  permissions: string[];
  scopes: UserScope[];
};
export type UserScope = { level: 'SITE' | 'AREA'; siteId: string | null; areaId: string | null };
export type CreateUserValues = {
  username: string;
  email: string;
  name: string;
  password: string;
  roleIds: string[];
};
