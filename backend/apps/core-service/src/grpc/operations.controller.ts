import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { IncidentsService } from '../modules/incidents/incidents.service';
import { WorkersService } from '../modules/workers/workers.service';
import { DashboardService } from '../modules/dashboard/dashboard.service';

interface GetIncidentDetailRequest {
  incidentId: string;
  tenantId: string;
}

interface GetDashboardStatsRequest {
  tenantId: string;
}

/**
 * The real service-to-service call in this system: notification-service
 * hits this over gRPC (not REST, not the message bus) to fetch the full
 * incident record after receiving a lightweight RabbitMQ event.
 */
@Controller()
export class OperationsGrpcController {
  constructor(
    private readonly incidentsService: IncidentsService,
    private readonly workersService: WorkersService,
    private readonly dashboardService: DashboardService,
  ) {}

  @GrpcMethod('OperationsService', 'GetIncidentDetail')
  async getIncidentDetail(request: GetIncidentDetailRequest) {
    const incident = await this.incidentsService.findOneOrThrow(
      request.tenantId,
      request.incidentId,
    );

    let workerName = 'Unassigned';
    if (incident.workerId) {
      try {
        const worker = await this.workersService.findOneOrThrow(request.tenantId, incident.workerId);
        workerName = worker.fullName;
      } catch {
        // worker may have been removed; fall back silently
      }
    }

    return {
      id: incident.id,
      tenantId: incident.tenantId,
      workerName,
      location: incident.location,
      status: incident.status,
      reportedByEmail: incident.reportedByEmail,
      createdAt: incident.createdAt.toISOString(),
    };
  }

  @GrpcMethod('OperationsService', 'GetDashboardStats')
  async getDashboardStats(request: GetDashboardStatsRequest) {
    const stats = await this.dashboardService.getStats(request.tenantId);
    return stats;
  }
}
