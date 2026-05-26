import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsString, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminAppointmentDto {
  @ApiProperty({ example: 'Rajesh Kumar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  patientName: string;

  @ApiProperty({ example: 'Dr. Sharma' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  doctorName: string;

  @ApiProperty({ example: 'checkup' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @ApiProperty({ example: '10:30 AM' })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ example: '647f12345678901234567890', required: false })
  @IsString()
  @IsOptional()
  hospitalId?: string;
}