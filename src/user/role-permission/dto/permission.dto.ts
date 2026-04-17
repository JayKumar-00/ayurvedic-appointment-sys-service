import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class PermissionDto {
  @ApiProperty({ example: 'patients' })
  @IsString()
  @IsNotEmpty()
  module!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  create!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  read!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  update!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  delete!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  export!: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  report!: boolean;
}
