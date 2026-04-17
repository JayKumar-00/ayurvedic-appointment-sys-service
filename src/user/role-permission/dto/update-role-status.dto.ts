import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRoleStatusDto {
  @ApiProperty({ example: true, description: 'Set role active or inactive' })
  @IsBoolean()
  isActive!: boolean;
}