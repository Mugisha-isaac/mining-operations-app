export enum IncidentStatus {
  REPORTED = 'REPORTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
}

// The only transitions a supervisor/admin may perform through the API.
// Enforced in IncidentsService.updateStatus so state can't jump arbitrarily.
export const ALLOWED_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.REPORTED]: [IncidentStatus.UNDER_REVIEW],
  [IncidentStatus.UNDER_REVIEW]: [IncidentStatus.RESOLVED],
  [IncidentStatus.RESOLVED]: [],
};
