import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminAppointmentDocument = HydratedDocument<AdminAppointment>;

@Schema({ 
    timestamps: true,
    collection: 'admin_appointments',
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
export class AdminAppointment {

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  patientName: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 100,
  })
  doctorName: string;

  @Prop({
    required: true,
    trim: true,
  })
  type: string;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    required: true,
  })
  time: string;

  @Prop({
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop({ type: String, trim: true, index: true })
  hospitalId?: string;
}

export const AdminAppointmentSchema = SchemaFactory.createForClass(AdminAppointment);