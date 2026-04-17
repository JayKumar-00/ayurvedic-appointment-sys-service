import { ApiProperty } from '@nestjs/swagger';
import { AppointmentResponseDto } from './appointment.response.dto';

class AppointmentPaginationMetaDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 20 })
  totalItems!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}

export class AppointmentListResponseDto {
  @ApiProperty({ type: [AppointmentResponseDto] })
  data!: AppointmentResponseDto[];

  @ApiProperty({ type: AppointmentPaginationMetaDto })
  meta!: AppointmentPaginationMetaDto;
}
