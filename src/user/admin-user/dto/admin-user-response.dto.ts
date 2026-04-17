import { ApiProperty } from '@nestjs/swagger';

export class AdminUserResponseDto {
  @ApiProperty({ example: '66f0f9cb3a5a8dc4d2961001' })
  id!: string;

  @ApiProperty({ example: 'Hospital Admin' })
  name!: string;

  @ApiProperty({ example: 'admin.hospital@ayurvedic.com' })
  email!: string;

  @ApiProperty({ example: 'hospital-id-123' })
  hospitalId!: string;

  @ApiProperty({ example: 'role-reception', required: false })
  roleId?: string;

  @ApiProperty({ example: true })
  isAdmin!: boolean;

  @ApiProperty({ example: false })
  isSystemAdmin!: boolean;

  @ApiProperty({ example: true })
  isActive!: boolean;
}
