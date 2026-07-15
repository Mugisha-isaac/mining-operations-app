import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { WorkersModule } from '../workers/workers.module';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
  imports: [WorkersModule, IncidentsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
