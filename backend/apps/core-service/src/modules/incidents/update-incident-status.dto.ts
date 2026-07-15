import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IncidentStatus } from '@minetech/common';

export class UpdateIncidentStatusDto {
  @ApiProperty({ enum: IncidentStatus, example: IncidentStatus.UNDER_REVIEW })
  @IsEnum(IncidentStatus)
  status: IncidentStatus;
}
