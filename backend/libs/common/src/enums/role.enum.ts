export enum Role {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
}

/**
 * Fine-grained permissions. Roles are a bundle of permissions; guards check
 * permissions, not raw role strings, so new roles can be introduced later
 * without touching every endpoint.
 */
export enum Permission {
  WORKER_CREATE = 'WORKER_CREATE',
  WORKER_READ = 'WORKER_READ',
  WORKER_CHECK_IN_OUT = 'WORKER_CHECK_IN_OUT',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_READ = 'INCIDENT_READ',
  INCIDENT_UPDATE_STATUS = 'INCIDENT_UPDATE_STATUS',
  DASHBOARD_READ = 'DASHBOARD_READ',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.WORKER_CREATE,
    Permission.WORKER_READ,
    Permission.WORKER_CHECK_IN_OUT,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.INCIDENT_UPDATE_STATUS,
    Permission.DASHBOARD_READ,
  ],
  [Role.SUPERVISOR]: [
    Permission.WORKER_READ,
    Permission.WORKER_CHECK_IN_OUT,
    Permission.INCIDENT_CREATE,
    Permission.INCIDENT_READ,
    Permission.DASHBOARD_READ,
  ],
};
