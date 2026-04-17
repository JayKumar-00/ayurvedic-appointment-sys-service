import { ApiProperty } from '@nestjs/swagger';
import { AdminUserResponseDto } from './admin-user-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserResponseDto] })
  data!: AdminUserResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
