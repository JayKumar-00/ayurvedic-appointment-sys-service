import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'systemAdmin@ayurvedic.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password (minimum 6 characters)',
    example: 'SystemAdmin@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
