import { ApiProperty } from '@nestjs/swagger';

export class HospitalResponseDto {
  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2961001' })
  id!: string;

  @ApiProperty({ example: 'Ayurvedic Multispeciality Hospital' })
  name!: string;

  @ApiProperty({ example: 'AYUR-HOSP-001' })
  code!: string;

  @ApiProperty({ example: '12 Herbal Street, Pune', required: false })
  address?: string;

  @ApiProperty({ example: '+91-9988776655', required: false })
  phone?: string;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
