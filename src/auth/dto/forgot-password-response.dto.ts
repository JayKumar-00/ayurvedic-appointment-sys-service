import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Generic response message to avoid account enumeration',
    example:
      'If an account exists for this email, a reset link has been generated.',
  })
  message!: string;

  @ApiPropertyOptional({
    description:
      'Development-only reset token. Remove this from response when email delivery is integrated.',
    example: 'b8d6e7a4f2f1f6c7d3c8f1b2a4d5e6f7c8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
  })
  resetToken?: string;

  @ApiPropertyOptional({
    description: 'Reset token expiration timestamp',
    example: '2026-04-14T12:30:00.000Z',
  })
  expiresAt?: Date;
}
