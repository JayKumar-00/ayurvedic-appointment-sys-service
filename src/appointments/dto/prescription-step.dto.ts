import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
} from 'class-validator';

export class PrescriptionStepDto {
  @ApiProperty({
    example: 'Take Tab. Paracetamol 500mg twice daily for 3 days',
    description: 'Doctor prescription notes',
  })
  @IsString()
  prescription!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Paracetamol 500mg', 'ORS'],
    description: 'Optional list of medicines',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether revisit is required',
  })
  @Type(() => Boolean)
  @IsBoolean()
  revisitRequired!: boolean;

  @ApiPropertyOptional({
    example: '2026-04-25',
    description: 'Revisit date when revisit is required',
  })
  @IsOptional()
  @IsDateString()
  revisitDate?: string;

  @ApiPropertyOptional({
    example: 'Drink warm water and avoid oily food',
    description: 'Additional doctor advice',
  })
  @IsOptional()
  @IsString()
  advice?: string;
}
