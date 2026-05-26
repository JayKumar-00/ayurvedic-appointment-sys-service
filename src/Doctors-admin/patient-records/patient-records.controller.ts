import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { StaffGuard } from "src/auth/guards/staff.guard";
import { CreatePatientRecordDto } from "./dto/create-patient-record.dto";
import { PatientRecordsService } from "./patient-records.service";

@ApiTags('Doctor-admin-PatientRecords')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard)
@Controller('patient-records')
export class PatientRecordsController {
    constructor(private readonly patientRecordsService: PatientRecordsService) {}

    @Post()
    @ApiOperation({ summary: 'Save patient record' })
    @ApiResponse({ status: 201, description: 'Patient record saved successfully' })
    async create(@Body() createDto: CreatePatientRecordDto) {
        return this.patientRecordsService.createOrUpdate(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all patient records' })
    @ApiResponse({ status: 200, description: 'All patient records fetched successfully' })
    async findAll() {
        return this.patientRecordsService.findAll();
    }
}
