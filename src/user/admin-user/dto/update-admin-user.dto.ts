import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminUserDto {
  @ApiPropertyOptional({
    description: 'Admin display name',
    example: 'Hospital Admin',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'Admin contact phone',
    example: '+91-9876543210',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Admin address',
    example: '12 Herbal Street, Pune',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    description: 'Admin account active flag',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Role id for role-based access',
    example: 'role-reception',
  })
  @IsOptional()
  @IsString()
  roleId?: string;
}
