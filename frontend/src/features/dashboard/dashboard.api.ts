import { apiClient } from '@/api/client';

export interface DashboardStats {
  workersOnShift: number;
  openIncidents: number;
  resolvedToday: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>('/api/dashboard/stats');
  return data;
}
