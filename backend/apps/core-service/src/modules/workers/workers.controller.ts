import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Permission,
  CurrentUser,
  AuthenticatedUser,
} from '@minetech/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './create-worker.dto';

@ApiTags('workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @RequirePermissions(Permission.WORKER_CREATE)
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateWorkerDto) {
    return this.workersService.create(user.tenantId, dto);
  }

  @Get()
  @RequirePermissions(Permission.WORKER_READ)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.workersService.findAll(user.tenantId);
  }

  @Post(':id/check-in')
  @RequirePermissions(Permission.WORKER_CHECK_IN_OUT)
  checkIn(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.workersService.checkIn(user.tenantId, id);
  }

  @Post(':id/check-out')
  @RequirePermissions(Permission.WORKER_CHECK_IN_OUT)
  checkOut(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.workersService.checkOut(user.tenantId, id);
  }
}
