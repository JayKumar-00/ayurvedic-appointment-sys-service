import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { PermissionDto } from './permission.dto';

export class CreateRoleDto {
  @ApiProperty({ example: 'Reception Team' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'hospital-id-123' })
  @IsString()
  @IsNotEmpty()
  hospitalId!: string;

  @ApiProperty({ type: [PermissionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions!: PermissionDto[];
}
