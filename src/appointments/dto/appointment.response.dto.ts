import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AppointmentStatus } from '../constants/appointment-status';

export class AppointmentResponseDto {
  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2963001' })
  id!: string;

  @ApiProperty({ type: Object })
  patientDetails!: Record<string, unknown>;

  @ApiPropertyOptional({ type: Object })
  pastMedicalHistory?: Record<string, unknown> | string;

  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2962001' })
  doctorId!: string;

  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2961002' })
  hospitalId!: string;

  @ApiProperty({ example: '2026-04-17T00:00:00.000Z' })
  appointmentDate!: string;

  @ApiProperty({ example: '09:00-09:30' })
  timeSlot!: string;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
  })
  status!: AppointmentStatus;

  @ApiPropertyOptional({ example: '66f0f9cb3a5a8dc4d2969001' })
  createdBy?: string;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-04-17T12:00:00.000Z' })
  updatedAt!: string;
}
