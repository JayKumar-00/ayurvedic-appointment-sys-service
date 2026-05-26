import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, MaxLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePatientsDto {
  @ApiProperty({
    description: 'Name of Patient',
    example: 'Rajesh Kumar',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email of Patient',
    example: 'rajeshkumar@gmail.com',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({
    description: 'Phone number of Patient',
    example: 9876543210,
  })
  @IsNumber()
  @IsNotEmpty()
  phone: number;

  @ApiProperty({
    description: 'Gender',
    example: 'M',
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    description: 'Age',
    example: 25,
  })
  @IsNumber()
  @IsNotEmpty()
  age: number;

  @ApiProperty({
    description: 'Blood Group',
    example: 'O+',
  })
  @IsString()
  @IsNotEmpty()
  bloodGroup: string;

  @ApiProperty({
    description: 'Appointment Date',
    example: '2026-05-01',
  })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  appointmentDate: Date;

  @ApiProperty({
    description: 'is Active',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({
    description: 'Hospital ID',
    example: '647f12345678901234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  hospitalId?: string;
}