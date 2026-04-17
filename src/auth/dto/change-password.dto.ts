import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'password@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  currentPassword!: string;

  @ApiProperty({
    description: 'New password',
    example: 'StrongPassword@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
