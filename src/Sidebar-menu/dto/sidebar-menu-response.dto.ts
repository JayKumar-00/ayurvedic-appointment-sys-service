import { ApiProperty } from '@nestjs/swagger';

export class MenuItemDto {
  @ApiProperty({ example: 'Dashboard' })
  label!: string;

  @ApiProperty({ example: 'LayoutGrid' })
  icon!: string;

  @ApiProperty({ example: 'dashboard' })
  view!: string;

  @ApiProperty({ example: '/dashboard' })
  href!: string;
}

export class MenuSectionDto {
  @ApiProperty({ example: 'Main Menu' })
  sectionName!: string;

  @ApiProperty({ type: [MenuItemDto] })
  items!: MenuItemDto[];
}

export class SidebarMenuResponseDto {
  @ApiProperty({ example: 'doctor' })
  role!: string;

  @ApiProperty({ type: [MenuSectionDto] })
  sections!: MenuSectionDto[];
}
