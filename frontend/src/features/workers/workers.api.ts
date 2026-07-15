import { apiClient } from '@/api/client';

export interface WorkerBase {
  id: string;
  fullName: string;
  employeeCode: string;
  role?: string;
  createdAt: string;
}

export interface Worker extends WorkerBase {
  onShift: boolean;
}

export interface Shift {
  id: string;
  workerId: string;
  status: 'ON_SHIFT' | 'OFF_SHIFT';
  checkInAt: string;
  checkOutAt: string | null;
}

export async function fetchWorkers(): Promise<Worker[]> {
  const { data } = await apiClient.get<Worker[]>('/api/workers');
  return data;
}

export async function createWorker(input: {
  fullName: string;
  employeeCode: string;
  role?: string;
}): Promise<WorkerBase> {
  const { data } = await apiClient.post<WorkerBase>('/api/workers', input);
  return data;
}

export async function checkInWorker(workerId: string): Promise<Shift> {
  const { data } = await apiClient.post<Shift>(`/api/workers/${workerId}/check-in`);
  return data;
}

export async function checkOutWorker(workerId: string): Promise<Shift> {
  const { data } = await apiClient.post<Shift>(`/api/workers/${workerId}/check-out`);
  return data;
}
