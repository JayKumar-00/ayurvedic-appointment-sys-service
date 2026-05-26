import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from 'mongoose';

export type PatientQueueDocument = HydratedDocument<PatientQueue>;

@Schema({
    timestamps: true,
    collection: 'patient_queue'
})
export class PatientQueue {
    @Prop({
        type: Types.ObjectId,
        ref: 'ReceptionistAppointment',
        required: true
    })
    appointmentId: Types.ObjectId;

    @Prop({ default: 0 })
    Weight?: number;

    @Prop({ default: 0 })
    Bp?: number;

    @Prop({ default: 0 })
    bloodSugar?: number;

    @Prop({ trim: true, default: '' })
    notes?: string;

    @Prop({
        type: String,
        enum: ['waiting', 'ready-for-doctor', 'sent-to-doctor', 'with-doctor', 'completed'],
        default: 'waiting'
    })
    status: string;
}

export const PatientQueueSchema = SchemaFactory.createForClass(PatientQueue);
