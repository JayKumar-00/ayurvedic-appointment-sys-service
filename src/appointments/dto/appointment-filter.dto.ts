import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { APPOINTMENT_STATUSES } from '../constants/appointment-status';

export class AppointmentFilterDto {
  @ApiPropertyOptional({ example: 'john', description: 'Search patient name or slot' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '66f0f9cb3a5a8dc4d2961001' })
  @IsOptional()
  @IsString()
  hospitalId?: string;

  @ApiPropertyOptional({ example: '66f0f9cb3a5a8dc4d2962001' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'pending', enum: APPOINTMENT_STATUSES })
  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: (typeof APPOINTMENT_STATUSES)[number];

  @ApiPropertyOptional({ example: '2026-04-17' })
  @IsOptional()
  @IsString()
  appointmentDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
