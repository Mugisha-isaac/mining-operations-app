import { Injectable } from '@nestjs/common';
import { WorkersService } from '../workers/workers.service';
import { IncidentsService } from '../incidents/incidents.service';

export interface DashboardStatsDto {
  workersOnShift: number;
  openIncidents: number;
  resolvedToday: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly workersService: WorkersService,
    private readonly incidentsService: IncidentsService,
  ) {}

  async getStats(tenantId: string): Promise<DashboardStatsDto> {
    const [workersOnShift, openIncidents, resolvedToday] = await Promise.all([
      this.workersService.countOnShift(tenantId),
      this.incidentsService.countOpen(tenantId),
      this.incidentsService.countResolvedToday(tenantId),
    ]);
    return { workersOnShift, openIncidents, resolvedToday };
  }
}
