import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateHospitalAdminDto {
  @ApiProperty({
    description: 'Admin full name',
    example: 'Hospital Admin',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Admin email',
    example: 'admin.hospital@ayurvedic.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Admin login password',
    example: 'StrongPassword@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
