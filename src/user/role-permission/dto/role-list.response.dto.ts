import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from './role.response.dto';

class RolePaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 20 })
  totalItems!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}

export class RoleListResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  data!: RoleResponseDto[];

  @ApiProperty({ type: RolePaginationMetaDto })
  meta!: RolePaginationMetaDto;
}
