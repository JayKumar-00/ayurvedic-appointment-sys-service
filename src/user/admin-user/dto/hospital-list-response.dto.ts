import { ApiProperty } from '@nestjs/swagger';
import { HospitalResponseDto } from './hospital-response.dto';
import { PaginationMetaDto } from './pagination-meta.dto';

export class HospitalListResponseDto {
  @ApiProperty({ type: [HospitalResponseDto] })
  data!: HospitalResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta!: PaginationMetaDto;
}
