import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateHospitalDto {
  @ApiProperty({
    description: 'Hospital name',
    example: 'Ayurvedic Multispeciality Hospital',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description: 'Hospital address',
    example: '12 Herbal Street, Pune',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiProperty({
    description: 'Hospital contact number',
    example: '+91-9988776655',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}
