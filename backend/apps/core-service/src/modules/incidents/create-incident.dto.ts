import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ example: 'Loose scaffolding on level 2' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Scaffolding bracket came loose during shift change.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Shaft B, Level 2' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ required: false, example: 'a1b2c3d4-...' })
  @IsOptional()
  @IsString()
  workerId?: string;
}
