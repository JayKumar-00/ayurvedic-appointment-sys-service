import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class BloodPressureDto {
  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsInt()
  systolic!: number;

  @ApiProperty({ example: 80 })
  @Type(() => Number)
  @IsInt()
  diastolic!: number;
}

export class PreMedicalCheckupDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  patientName!: string;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  age!: number;

  @ApiProperty({ example: 'Male', enum: ['Male', 'Female', 'Other'] })
  @IsIn(['Male', 'Female', 'Other'])
  gender!: string;

  @ApiProperty({ example: 'Mild headache and fatigue' })
  @IsString()
  chiefComplaint!: string;

  @ApiPropertyOptional({ example: 'Headache, fatigue' })
  @IsOptional()
  @IsString()
  symptoms?: string;

  @ApiProperty({ example: 'low', enum: ['low', 'medium', 'high', 'critical'] })
  @IsIn(['low', 'medium', 'high', 'critical'])
  triageLevel!: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ type: BloodPressureDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BloodPressureDto)
  bp?: BloodPressureDto;

  @ApiPropertyOptional({ example: 72 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pulseRate?: number;

  @ApiPropertyOptional({ example: 98.6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 98 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  spO2?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  bloodSugar?: number;

  @ApiPropertyOptional({ example: 3, minimum: 0, maximum: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @ApiPropertyOptional({ type: [String], example: ['Penicillin'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Paracetamol'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  currentMedications?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Asthma'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pastConditions?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Diabetes'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  familyHistory?: string[];

  @ApiPropertyOptional({ example: 'OPD' })
  @IsOptional()
  @IsString()
  visitType?: string;

  @ApiPropertyOptional({ example: 'Patient stable' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: '2026-04-18T12:00:00.000Z',
    description: 'Optional recorded time; defaults to now',
  })
  @IsOptional()
  @IsString()
  recordedAt?: string;
}
