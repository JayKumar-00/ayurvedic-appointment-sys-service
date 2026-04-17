import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address for password reset flow',
    example: 'admin@ayurvedic.local',
  })
  @IsEmail()
  email!: string;
}
