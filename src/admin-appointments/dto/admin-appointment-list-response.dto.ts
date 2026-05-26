import { ApiProperty } from '@nestjs/swagger';
import { AdminAppointmentResponseDto } from './admin-appointment-response.dto';
import { PaginationMetaDto } from 'src/user/admin-user/dto/pagination-meta.dto';

export class AdminAppointmentListResponseDto {
  @ApiProperty({ type: [AdminAppointmentResponseDto] })
  data: AdminAppointmentResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}