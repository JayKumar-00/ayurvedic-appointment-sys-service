import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({
    description: 'Optional detailed validation messages',
    example: ['name should not be empty'],
    type: [String],
  })
  details?: string[];

  @ApiProperty({ example: '/api/v1/system-admin/hospitals' })
  path!: string;

  @ApiProperty({
    example: '2026-04-15T10:30:00.000Z',
  })
  timestamp!: string;
}
