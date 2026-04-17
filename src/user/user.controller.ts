import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StaffService } from './user.service';
import { CreateStaffDto } from './dto/create-user.dto';
import { ApiErrorResponseDto } from 'src/common/dto/api-error-response.dto';
import { StaffFilterDto } from './dto/staff-filter.dto';
import { UpdateStaffDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { AdminLevelGuard } from './admin-user/guards/admin-level.guard';
import { SystemAdminGuard } from './admin-user/guards/system-admin.guard';
import { Staff } from './entity/user.entity';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminLevelGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiBody({ type: CreateStaffDto })
  @ApiOperation({ summary: 'Create a new staff member' })
  @ApiResponse({ status: 201, description: 'Staff created successfully' })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  createStaff(
    @Req() req: { user: JwtPayload },
    @Body() createStaffDto: CreateStaffDto,
  ) {
    const user = req.user;
    if (user.isAdmin && !user.isSystemAdmin) {
      if (!user.hospitalId) {
        throw new ForbiddenException(
          'Admin user must have a hospital assigned',
        );
      }
      if (createStaffDto.hospitalId !== user.hospitalId) {
        throw new ForbiddenException(
          'Admin users can only create staff for their assigned hospital',
        );
      }
    }

    return this.staffService.createStaff(createStaffDto, user.sub);
  }

  @Get()
  @UseGuards(SystemAdminGuard)
  @ApiOperation({ summary: 'Get all staff members with filters' })
  @ApiResponse({
    status: 200,
    description: 'Staff members fetched successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'hospitalId', required: false })
  @ApiQuery({ name: 'roleId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  getAllStaff(@Query() filter: StaffFilterDto) {
    return this.staffService.getAllStaff(filter);
  }

  @Get('hospital/:hospitalId')
  @ApiOperation({ summary: 'Get staff members by hospital id' })
  @ApiResponse({
    status: 200,
    description: 'Staff members by hospital fetched successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiParam({ name: 'hospitalId', description: 'Hospital id' })
  getStaffByHospitalId(
    @Req() req: { user: JwtPayload },
    @Param('hospitalId') hospitalId: string,
  ): Promise<Staff[]> {
    const user = req.user;
    if (user.isAdmin && !user.isSystemAdmin) {
      if (!user.hospitalId) {
        throw new ForbiddenException(
          'Admin user must have a hospital assigned',
        );
      }
      if (hospitalId !== user.hospitalId) {
        throw new ForbiddenException(
          'Admin users can only access staff from their assigned hospital',
        );
      }
    }

    return this.staffService.getStaffByHospitalId(hospitalId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a staff member by id' })
  @ApiResponse({
    status: 200,
    description: 'Staff member fetched successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiParam({ name: 'id', description: 'Staff id' })
  async getStaffById(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
  ): Promise<Staff> {
    const user = req.user;
    const staff = await this.staffService.getStaffById(id);

    if (user.isAdmin && !user.isSystemAdmin) {
      if (!user.hospitalId) {
        throw new ForbiddenException(
          'Admin user must have a hospital assigned',
        );
      }
      const staffHospitalId =
        (
          staff.hospitalId as { _id?: { toString: () => string } }
        )?._id?.toString() ?? staff.hospitalId.toString();

      if (staffHospitalId !== user.hospitalId) {
        throw new ForbiddenException(
          'Admin users can only access staff from their assigned hospital',
        );
      }
    }

    return staff;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a staff member' })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiParam({ name: 'id', description: 'Staff id' })
  async updateStaff(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ): Promise<Staff> {
    const user = req.user;
    if (user.isAdmin && !user.isSystemAdmin) {
      if (!user.hospitalId) {
        throw new ForbiddenException(
          'Admin user must have a hospital assigned',
        );
      }
      const staff = await this.staffService.getStaffById(id);
      const staffHospitalId =
        (
          staff.hospitalId as { _id?: { toString: () => string } }
        )?._id?.toString() ?? staff.hospitalId.toString();

      if (staffHospitalId !== user.hospitalId) {
        throw new ForbiddenException(
          'Admin users can only update staff from their assigned hospital',
        );
      }
    }

    return this.staffService.updateStaff(id, updateStaffDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a staff member' })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
  })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiInternalServerErrorResponse({ type: ApiErrorResponseDto })
  @ApiParam({ name: 'id', description: 'Staff id' })
  async deleteStaff(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
  ): Promise<void> {
    const user = req.user;
    if (user.isAdmin && !user.isSystemAdmin) {
      if (!user.hospitalId) {
        throw new ForbiddenException(
          'Admin user must have a hospital assigned',
        );
      }
      const staff = await this.staffService.getStaffById(id);
      const staffHospitalId =
        (
          staff.hospitalId as { _id?: { toString: () => string } }
        )?._id?.toString() ?? staff.hospitalId.toString();

      if (staffHospitalId !== user.hospitalId) {
        throw new ForbiddenException(
          'Admin users can only delete staff from their assigned hospital',
        );
      }
    }

    return this.staffService.deleteStaff(id);
  }
}
