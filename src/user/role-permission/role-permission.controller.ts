import {
  Body,
  Controller,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { RequirePermission } from './decorators/require-permission.decorator';
import { PermissionGuard } from './guards/permission.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleFilterDto } from './dto/role-filter.dto';
import { RoleListResponseDto } from './dto/role-list.response.dto';
import { RoleResponseDto } from './dto/role.response.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { UpdateRolePermissionsDto } from './dto/update-role-permissions.dto';
import { RolePermissionService } from './role-permission.service';

@ApiTags('Role & Permission')
@ApiBearerAuth()
@Controller('system-admin/roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolePermissionController {
  constructor(private readonly rolePermissionService: RolePermissionService) {}

  @Post()
  @RequirePermission('roles', 'create')
  @ApiOperation({ summary: 'Create a role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiConflictResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolePermissionService.createRole(createRoleDto);
  }

  @Patch(':id/status')
  @RequirePermission('roles', 'update')
  @ApiOperation({ summary: 'Update role active status' })
  @ApiResponse({
    status: 200,
    description: 'Role status updated successfully',
    type: RoleResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateRoleStatus(
    @Param('id') id: string,
    @Body() updateRoleStatusDto: UpdateRoleStatusDto,
  ) {
    return this.rolePermissionService.updateRoleStatus(id, updateRoleStatusDto);
  }

  @Patch(':id/permissions')
  @RequirePermission('roles', 'update')
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiResponse({
    status: 200,
    description: 'Role permissions updated successfully',
    type: RoleResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  updateRolePermissions(
    @Param('id') id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.rolePermissionService.updateRolePermissions(
      id,
      updateRolePermissionsDto,
    );
  }

  @Get()
  @RequirePermission('roles', 'read')
  @ApiOperation({ summary: 'Get roles with filters' })
  @ApiResponse({
    status: 200,
    description: 'Roles fetched successfully',
    type: RoleListResponseDto,
  })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  getRoles(@Query() filter: RoleFilterDto) {
    return this.rolePermissionService.getRoles(filter);
  }

  @Get('hospital/:hospitalId')
  @RequirePermission('roles', 'read')
  @ApiOperation({ summary: 'Get all roles for a hospital' })
  @ApiResponse({
    status: 200,
    description: 'Hospital roles fetched successfully',
    type: RoleListResponseDto,
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  getRolesByHospital(
    @Param('hospitalId') hospitalId: string,
    @Query() filter: RoleFilterDto,
  ) {
    return this.rolePermissionService.getRoles({
      ...filter,
      hospitalId,
    });
  }
}
