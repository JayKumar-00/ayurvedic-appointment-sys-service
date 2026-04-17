import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User id',
    example: '66f0f9cb3a5a8dc4d2961001',
  })
  id!: string;

  @ApiProperty({
    description: 'User email',
    example: 'admin@ayurvedic.local',
  })
  email!: string;

  @ApiProperty({
    description: 'Role id assigned to user',
    example: 'role-admin',
    required: false,
  })
  roleId?: string;

  @ApiProperty({
    description: 'Hospital id associated with user',
    example: 'hospital-main',
  })
  hospitalId!: string;

  @ApiProperty({
    description: 'System admin flag',
    example: true,
  })
  isSystemAdmin!: boolean;

  @ApiProperty({
    description: 'Admin flag',
    example: true,
  })
  isAdmin!: boolean;
}
