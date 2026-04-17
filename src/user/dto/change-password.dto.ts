import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'New Password for the staff user',
    example: 'NewStrongPassword@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
