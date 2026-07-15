import { Observable } from 'rxjs';

export interface IncidentDetailGrpc {
  id: string;
  tenantId: string;
  workerName: string;
  location: string;
  status: string;
  reportedByEmail: string;
  createdAt: string;
}

export interface OperationsServiceGrpc {
  getIncidentDetail(data: { incidentId: string; tenantId: string }): Observable<IncidentDetailGrpc>;
}
