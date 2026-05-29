import {
    Controller,
    Get,
    Param,
    Query,
    Res
} from '@nestjs/common';
import * as express from 'express';
import { PrescriptionService } from './prescription.service';

@Controller('prescription')
export class PrescriptionController {
    constructor(
        private readonly prescriptionService: PrescriptionService,
    ) {}

    @Get('export/:id')
    async exportPrescription(
        @Param('id') id: string,
        @Query('doctorName') doctorName: string,
        @Query('specialization') specialization: string,
        @Res() res: express.Response,
    ) {
        return this.prescriptionService.exportPrescription(
            id,
            res,
            doctorName,
            specialization,
        );
    }
}