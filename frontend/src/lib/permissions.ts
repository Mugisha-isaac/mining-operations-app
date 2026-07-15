import type { Role } from '@/store/auth.store';


export enum Permission {
  WORKER_CREATE = 'WORKER_CREATE',
  WORKER_READ = 'WORKER_READ',
  WORKER_CHECK_IN_OUT = 'WORKER_CHECK_IN_OUT',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_READ = 'INCIDENT_READ',
  INCIDENT_UPDATE_STATUS = 'INCIDENT_UPDATE_STATUS',
  DASHBOARD_READ = 'DASHBOARD_READ',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    Permission.WORKER_CREATE,
    Permission.WORKER_READ,
    Permission.WORKER_CHECK_IN_OUT,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE_STATUS,
    Permission.DASHBOARD_READ,
  ],
  SUPERVISOR: [
    Permission.WORKER_READ,
    Permission.WORKER_CHECK_IN_OUT,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.DASHBOARD_READ,
  ],
};

export function hasPermission(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
