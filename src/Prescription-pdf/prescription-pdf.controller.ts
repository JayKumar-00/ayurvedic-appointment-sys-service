import {
    Controller,
    Get,
    Param,
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
        @Res() res: express.Response,
    ) {
        return this.prescriptionService.exportPrescription(
            id,
            res
        );
    }
}