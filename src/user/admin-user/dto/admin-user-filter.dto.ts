import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return value;
};

export class AdminUserFilterDto {
  @ApiPropertyOptional({ example: 'admin', description: 'Search across name, email, and hospital id' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'hospital-id-123', description: 'Filter by hospital id' })
  @IsOptional()
  @IsString()
  hospitalId?: string;

  @ApiPropertyOptional({ example: true, description: 'Filter by admin status' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isAdmin?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Filter by system admin status' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isSystemAdmin?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
