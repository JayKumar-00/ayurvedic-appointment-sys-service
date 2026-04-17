import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import type { AppointmentStatus } from '../constants/appointment-status';

export type AppointmentDocument = HydratedDocument<Appointment>;

@Schema({ _id: false })
export class AppointmentPatientDetails {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  gender?: string;

  @Prop({ trim: true })
  age?: string;

  @Prop({ trim: true })
  address?: string;
}

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  @Prop({ type: SchemaTypes.Mixed, required: true })
  patientDetails!: Record<string, unknown> | AppointmentPatientDetails;

  @Prop({ type: SchemaTypes.Mixed })
  pastMedicalHistory?: Record<string, unknown> | string;

  @Prop({ type: Types.ObjectId, ref: 'Staff', required: true, index: true })
  doctorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital', required: true, index: true })
  hospitalId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  appointmentDate!: Date;

  @Prop({ required: true, trim: true, index: true })
  timeSlot!: string;

  @Prop({
    required: true,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
    index: true,
  })
  status!: AppointmentStatus;

  @Prop({ type: Types.ObjectId, required: false, index: true })
  createdBy?: Types.ObjectId;

  createdAt!: Date;

  updatedAt!: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
AppointmentSchema.index({
  hospitalId: 1,
  doctorId: 1,
  appointmentDate: 1,
  timeSlot: 1,
});
