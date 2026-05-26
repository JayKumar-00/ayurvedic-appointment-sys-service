import { ApiProperty } from '@nestjs/swagger';

export class AdminAppointmentResponseDto {
  @ApiProperty({ example: '662e4e2f3d3e3a3f3d3e3a3f' })
  _id: string;

  @ApiProperty({ example: 'Rajesh Kumar' })
  patientName: string;

  @ApiProperty({ example: 'Dr. Sharma' })
  doctorName: string;

  @ApiProperty({ example: 'Online' })
  type: string;

  @ApiProperty({ example: '2026-05-01' })
  date: Date;

  @ApiProperty({ example: '10:30 AM' })
  time: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '647f12345678901234567890' })
  hospitalId?: string;
}