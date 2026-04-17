import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class UpdateHospitalDto {
  @ApiPropertyOptional({
    description: 'Name of the hospital',
    example: 'Ayurvedic Wellness Center',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Address of the hospital',
    example: '123 Herbal Street, Pune',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number of the hospital',
    example: '+91-9876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
