import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Operation result message',
    example: 'Operation successful',
  })
  message!: string;
}
