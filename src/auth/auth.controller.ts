import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiProduces,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LogoutResponseDto } from './dto/logout-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user with email and password. Returns access and refresh tokens.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - missing or invalid fields',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh Access Token',
    description:
      'Generate new access and refresh tokens using a valid refresh token. Old refresh token is revoked.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or revoked refresh token',
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is required',
  })
  refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refresh(refreshDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User Logout',
    description: 'Revoke the refresh token to invalidate all refresh attempts.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Logout successful',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Refresh token is required',
  })
  logout(@Body() refreshDto: RefreshDto) {
    return this.authService.logout(refreshDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password',
    description:
      'Generate a temporary password reset token for the given email address.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Reset process initiated',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload',
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description:
      'Set a new password using a valid reset token from forgot-password flow.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Password reset successful',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired reset token',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Change Password',
    description:
      'Authenticated user changes current password by providing old and new passwords.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'Password changed successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token or current password',
  })
  changePassword(
    @Req() req: { user: { sub: string } },
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Profile',
    description: 'Get authenticated user profile details from access token.',
  })
  @ApiProduces('application/json')
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getProfile(@Req() req: { user: { sub: string } }) {
    return this.authService.getProfile(req.user.sub);
  }
}
