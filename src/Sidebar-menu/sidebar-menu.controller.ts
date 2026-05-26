import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SidebarMenuService } from './sidebar-menu.service';
import { SidebarMenuResponseDto } from './dto/sidebar-menu-response.dto';

@ApiTags('Sidebar Menu')
@ApiBearerAuth()
@Controller('sidebar-menu')
@UseGuards(JwtAuthGuard)
export class SidebarMenuController {
  constructor(private readonly sidebarMenuService: SidebarMenuService) {}

  @Get()
  @ApiOperation({
    summary: 'Get sidebar menu for authenticated user',
    description: 'Returns the menu sections and items dynamically filtered by the logged-in user\'s role.'
  })
  @ApiResponse({ status: 200, description: 'Sidebar menu fetched successfully', type: SidebarMenuResponseDto })
  async getSidebarMenu(@Req() req: any) {
    return this.sidebarMenuService.getMenuForUser(req.user);
  }
}
