import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWorkerDto {
  @ApiProperty({ example: 'Jean Bosco' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'W-004', description: 'Unique employee code' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Driller', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}
