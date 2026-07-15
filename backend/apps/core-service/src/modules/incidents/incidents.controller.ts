import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Permission,
  CurrentUser,
  AuthenticatedUser,
} from '@minetech/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './create-incident.dto';
import { UpdateIncidentStatusDto } from './update-incident-status.dto';

@ApiTags('incidents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @RequirePermissions(Permission.INCIDENT_CREATE)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo'))
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateIncidentDto,
    @UploadedFile() photo: Express.Multer.File,
  ) {
    return this.incidentsService.create(
      { userId: user.userId, tenantId: user.tenantId, email: user.email },
      dto,
      photo,
    );
  }

  @Get()
  @RequirePermissions(Permission.INCIDENT_READ)
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.incidentsService.findAll(user.tenantId);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.INCIDENT_UPDATE_STATUS)
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.incidentsService.updateStatus(user.tenantId, id, dto.status);
  }
}
