import { ApiProperty } from '@nestjs/swagger';
import { PermissionDto } from './permission.dto';
import { Types } from 'mongoose';

export class RoleResponseDto {
  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2961001' })
  id!: string;

  @ApiProperty({ example: 'Reception Team' })
  name!: string;

  @ApiProperty({ example: 'hospital-id-123' })
  hospitalId!: Types.ObjectId;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ type: [PermissionDto] })
  permissions!: PermissionDto[];
}
