import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangeAdminPasswordDto {
  @ApiProperty({
    description: 'New password for the admin user',
    example: 'NewStrongPassword@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
