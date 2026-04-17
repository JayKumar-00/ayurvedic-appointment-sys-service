import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Dr.John', description: 'Name of the staff member' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'dr.john@example.com',
    description: 'Email of the staff member',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password for the staff member',
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number of the staff member',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109ca',
    description: 'Role ID assigned to the staff member',
  })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    example: '60d0fe4f5311236168a109cb',
    description: 'Hospital ID where the staff member works',
  })
  @IsString()
  @IsNotEmpty()
  hospitalId: string;

}
