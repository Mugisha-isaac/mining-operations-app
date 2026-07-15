import { apiClient } from '@/api/client';
import type { AuthUser } from '@/store/auth.store';

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  // Login is the one endpoint that bypasses /api - see api-gateway's
  // ProxyController, which forwards POST /auth/login without requiring a
  // token (there isn't one yet).
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { email, password });
  return data;
}
