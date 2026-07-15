import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Permission,
  CurrentUser,
  AuthenticatedUser,
} from '@minetech/common';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @RequirePermissions(Permission.DASHBOARD_READ)
  getStats(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.getStats(user.tenantId);
  }
}
