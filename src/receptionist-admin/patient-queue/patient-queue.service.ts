import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PatientQueue, PatientQueueDocument } from "./Schema/patient-queue.schema";

@Injectable()
export class PatientQueueService {
  private readonly logger = new Logger(PatientQueueService.name);

  constructor(
    @InjectModel(PatientQueue.name)
    private readonly patientQueueModel: Model<PatientQueueDocument>,
  ) {}

  private mapToResponse(entry: any) {
    const appointment = entry.appointmentId || {};
    return {
      _id: entry._id,
      id: entry._id || entry.id,
      appointmentId: appointment._id || appointment.id || null,
      patientName: appointment.patientName || 'Unknown Patient',
      phone: appointment.phone || 0,
      date: appointment.date || entry.createdAt,
      time: appointment.time || 'N/A',
      doctorName: appointment.doctorName || 'Not Assigned',
      checkupType: appointment.checkupType || 'General',
      Weight: entry.Weight || 0,
      Bp: entry.Bp || 0,
      bloodSugar: entry.bloodSugar || 0,
      notes: entry.notes || '',
      status: entry.status,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
  }

  async findAll() {
    try {
      // Find all queue entries, sort them so newer ones or those not completed are on top
      const entries = await this.patientQueueModel
        .find()
        .sort({ createdAt: -1 })
        .populate('appointmentId')
        .exec();
      
      return entries.map(entry => this.mapToResponse(entry));
    } catch (error) {
      this.logger.error(`Error fetching patient queue: ${error.message}`);
      throw new BadRequestException('Error fetching patient queue');
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      const allowedStatuses = ['waiting', 'ready-for-doctor', 'sent-to-doctor', 'with-doctor', 'completed'];
      if (!allowedStatuses.includes(status)) {
        throw new BadRequestException(`Invalid status: ${status}. Must be one of ${allowedStatuses.join(', ')}`);
      }

      const queueEntry = await this.patientQueueModel
        .findById(id)
        .populate('appointmentId')
        .exec();

      if (!queueEntry) {
        throw new NotFoundException(`Patient Queue record with id ${id} not found`);
      }

      queueEntry.status = status;
      await queueEntry.save();
      
      return this.mapToResponse(queueEntry);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error updating queue status: ${error.message}`);
      throw new BadRequestException('Error updating patient queue status');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.patientQueueModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Patient Queue record with id ${id} not found`);
      }
      return { message: 'Patient removed from queue successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting queue record: ${error.message}`);
      throw new BadRequestException('Error deleting patient queue record');
    }
  }
}
