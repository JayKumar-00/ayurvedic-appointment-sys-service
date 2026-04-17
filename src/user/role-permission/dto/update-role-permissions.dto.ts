import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ArrayMinSize, ValidateNested } from 'class-validator';
import { PermissionDto } from './permission.dto';

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
}
