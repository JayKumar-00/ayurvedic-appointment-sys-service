import { ApiProperty } from '@nestjs/swagger';

class AuthUserDto {
  @ApiProperty({
    description: 'Authenticated user id',
    example: '66f0f9cb3a5a8dc4d2961001',
  })
  id!: string;

  @ApiProperty({
    description: 'Authenticated user email',
    example: 'admin@ayurvedic.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Role id assigned to the user',
    example: 'role-admin',
    required: false,
  })
  roleId?: string;

  @ApiProperty({
    description: 'Hospital id assigned to the user',
    example: 'hospital-main',
  })
  hospitalId!: string;

  @ApiProperty({
    description: 'System admin permission',
    example: true,
  })
  isSystemAdmin!: boolean;

  @ApiProperty({
    description: 'Admin permission',
    example: true,
  })
  isAdmin!: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT Access token (valid for 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT Refresh token (valid for 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn!: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType!: string;

  @ApiProperty({
    description: 'Authenticated user details',
    type: AuthUserDto,
  })
  user!: AuthUserDto;
}
