import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({
    example: 'Dr.John',
    description: 'Name of the staff member',
  })
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number of the staff member',
  })
  @IsString()
  phone?: string;
}
