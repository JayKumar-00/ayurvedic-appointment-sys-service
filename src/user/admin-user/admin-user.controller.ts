import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminUserService } from './admin-user.service';
import { SystemAdminGuard } from './guards/system-admin.guard';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { CreateHospitalAdminDto } from './dto/create-hospital-admin.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { ChangeAdminPasswordDto } from './dto/change-admin-password.dto';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { AdminUserFilterDto } from './dto/admin-user-filter.dto';
import { HospitalFilterDto } from './dto/hospital-filter.dto';
import { AdminUserListResponseDto } from './dto/admin-user-list-response.dto';
import { HospitalListResponseDto } from './dto/hospital-list-response.dto';
import { HospitalResponseDto } from './dto/hospital-response.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@ApiTags('Admin-User <- System Admin')
@ApiBearerAuth()
@Controller('system-admin')
@UseGuards(JwtAuthGuard, SystemAdminGuard)
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post('hospitals')
  @ApiOperation({ summary: 'Create hospital (SystemAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Hospital created successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createHospital(@Body() createHospitalDto: CreateHospitalDto) {
    return this.adminUserService.createHospital(createHospitalDto);
  }

  @Get('hospitals')
  @ApiOperation({ summary: 'List hospitals with filters (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hospitals fetched successfully',
    type: HospitalListResponseDto,
  })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  findAllHospitals(@Query() filter: HospitalFilterDto) {
    return this.adminUserService.findAllHospitals(filter);
  }

  @Post('hospitals/:id/admin')
  @ApiOperation({ summary: 'Create hospital admin (SystemAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Hospital admin created successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createHospitalAdmin(
    @Param('id') hospitalId: string,
    @Body() createHospitalAdminDto: CreateHospitalAdminDto,
  ) {
    return this.adminUserService.createHospitalAdmin(
      hospitalId,
      createHospitalAdminDto,
    );
  }

  @Get('hospitals/:id')
  @ApiOperation({ summary: 'Get hospital by id (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hospital fetched successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findOneHospital(@Param('id') id: string) {
    return this.adminUserService.findOneHospital(id);
  }

  @Patch('hospital/:id')
  @ApiOperation({ summary: 'Update hospital details (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hospital updated successfully',
    type: HospitalResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateHospital(
    @Param('id') id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.adminUserService.updateHospitalDetail(id, updateHospitalDto);
  }

  @Patch('hospital/:id/status-toggle')
  @ApiOperation({ summary: 'Toggle hospital active status (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hospital status toggled successfully',
    type: HospitalResponseDto,
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  changeHospitalStatus(
    @Param('id') id: string,
    @Query('isActive') isActive: boolean,
  ) {
    return this.adminUserService.changeHospitalStauts(id, isActive);
  }

  @Get('admin-users')
  @ApiOperation({ summary: 'List admin users (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin users fetched successfully',
    type: AdminUserListResponseDto,
  })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'isAdmin', required: false, type: Boolean })
  @ApiQuery({ name: 'isSystemAdmin', required: false, type: Boolean })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  findAllAdminUsers(@Query() filter: AdminUserFilterDto) {
    return this.adminUserService.findAllAdminUsersWithFilters(filter);
  }

  @Get('admin-users/:id')
  @ApiOperation({ summary: 'Get admin user by id (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin user fetched successfully',
    type: AdminUserResponseDto,
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  findOneAdminUser(@Param('id') id: string) {
    return this.adminUserService.findOneAdminUser(id);
  }

  @Patch('admin-users/:id')
  @ApiOperation({
    summary: 'Update admin user details (without login credentials)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin user updated successfully',
    type: AdminUserResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateAdminUser(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    return this.adminUserService.updateAdminUser(id, updateAdminUserDto);
  }

  @Patch('admin-users/:id/password')
  @ApiOperation({ summary: 'Change admin user password (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  changeAdminPassword(
    @Param('id') id: string,
    @Body() changeAdminPasswordDto: ChangeAdminPasswordDto,
  ) {
    return this.adminUserService.changeAdminPassword(
      id,
      changeAdminPasswordDto,
    );
  }

  @Delete('admin-users/:id')
  @ApiOperation({ summary: 'Delete admin user (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Admin user deleted successfully',
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  removeAdminUser(@Param('id') id: string) {
    return this.adminUserService.removeAdminUser(id);
  }

  @Delete('admin-user/hospital/:id')
  @ApiOperation({ summary: 'Delete hospital (SystemAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'Hospital deleted successfully',
  })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  removeHospital(@Param('id') id: string) {
    return this.adminUserService.removeHospital(id);
  }
}
