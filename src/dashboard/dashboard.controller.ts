import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminLevelGuard } from 'src/user/admin-user/guards/admin-level.guard';
import { DashboardService } from './dashboard.service';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, AdminLevelGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dynamic stats for the admin dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics fetched successfully',
  })
  getStats(@Req() req: { user: JwtPayload }) {
    return this.dashboardService.getStats(req.user);
  }
}
