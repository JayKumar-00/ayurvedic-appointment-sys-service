import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsDateString,
  IsNotEmpty,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { APPOINTMENT_STATUSES } from '../constants/appointment-status';

export class PatientDetails {
  @ApiProperty({
    description: 'Patient name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name = '';

  @ApiProperty({
    description: 'Patient email address',
    example: 'john@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email = '';

  @ApiProperty({
    description: 'Patient phone number',
    example: '+919999999999',
  })
  @IsString()
  @IsNotEmpty()
  phone = '';

  @ApiProperty({
    description: 'Patient Age',
    example: '30',
  })
  @IsString()
  @IsNotEmpty()
  age = '';

  @ApiProperty({
    description: 'Patient Gender',
    example: 'Male',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Male', 'Female', 'Other'])
  gender = '';

  @ApiProperty({
    description: 'Patient Address',
    example: '123 Main St, City, Country',
  })
  @IsString()
  @IsNotEmpty()
  address = '';

  @ApiProperty({
    description: 'Any additional notes about the patient',
    example: 'Patient has a history of diabetes.',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient details object',
    type: () => PatientDetails,
    example: {
      name: 'John Doe',
      phone: '+919999999999',
      email: 'john@example.com',
      age: '30',
      gender: 'Male',
      address: '123 Main St, City, Country',
      notes: 'Patient has a history of diabetes.',
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PatientDetails)
  patientDetails!: PatientDetails;

  @ApiPropertyOptional({
    description: 'Past medical history object or text',
    example: { diabetes: true, hypertension: false },
  })
  @IsOptional()
  pastMedicalHistory?: Record<string, unknown> | string;

  @ApiProperty({
    example: '66f0f9cb3a5a8dc4d2961001',
    description: 'Doctor ID',
  })
  @IsString()
  doctorId!: string;

  @ApiProperty({
    example: '66f0f9cb3a5a8dc4d2961002',
    description: 'Hospital ID',
  })
  @IsString()
  hospitalId!: string;

  @ApiProperty({ example: '2026-04-17', description: 'Appointment date' })
  @IsDateString()
  appointmentDate!: string;

  @ApiProperty({ example: '09:00-09:30', description: 'Time slot' })
  @IsString()
  timeSlot!: string;

  @ApiPropertyOptional({
    example: 'pending',
    enum: APPOINTMENT_STATUSES,
    description: 'Appointment status',
  })
  @IsOptional()
  @IsIn(APPOINTMENT_STATUSES)
  status?: (typeof APPOINTMENT_STATUSES)[number];
}
