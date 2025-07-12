import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const AdminOnly = () => Roles('ADMIN');
export const ManagerOnly = () => Roles('MANAGER', 'ADMIN'); // Allow both MANAGER and ADMIN roles