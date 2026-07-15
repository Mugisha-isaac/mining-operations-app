import { apiClient } from '@/api/client';

export type IncidentStatus = 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  status: IncidentStatus;
  photoUrl: string;
  reportedByEmail: string;
  workerId: string | null;
  createdAt: string;
}

export async function fetchIncidents(): Promise<Incident[]> {
  const { data } = await apiClient.get<Incident[]>('/api/incidents');
  return data;
}

export async function createIncident(input: {
  title: string;
  description: string;
  location: string;
  workerId?: string;
  photo: File;
}): Promise<Incident> {
  const form = new FormData();
  form.append('title', input.title);
  form.append('description', input.description);
  form.append('location', input.location);
  if (input.workerId) form.append('workerId', input.workerId);
  form.append('photo', input.photo);

  const { data } = await apiClient.post<Incident>('/api/incidents', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

const NEXT_STATUS: Record<IncidentStatus, IncidentStatus | null> = {
  REPORTED: 'UNDER_REVIEW',
  UNDER_REVIEW: 'RESOLVED',
  RESOLVED: null,
};

export function nextStatusFor(status: IncidentStatus): IncidentStatus | null {
  return NEXT_STATUS[status];
}

export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<Incident> {
  const { data } = await apiClient.patch<Incident>(`/api/incidents/${id}/status`, { status });
  return data;
}
