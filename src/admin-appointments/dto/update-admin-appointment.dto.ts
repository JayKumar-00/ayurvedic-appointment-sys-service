import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAdminAppointmentDto {

  @ApiPropertyOptional({ example: 'Rajesh Kumar' })
  @IsOptional()
  @IsString()
  patientName: string;

  @ApiPropertyOptional({ example: 'Dr. Sharma' })
  @IsOptional()
  @IsString()
  doctorName: string;

  @ApiPropertyOptional({ example: 'checkup' })
  @IsOptional()
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional({ example: '11:00 AM' })
  @IsOptional()
  @IsString()
  time: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}