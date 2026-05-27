import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PatientRecordDocument = HydratedDocument<PatientRecord>;

@Schema({
    timestamps: true,
    collection: "patient-records",
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class PatientRecord {
    @Prop({ required: true, trim: true })
    patientName: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    age: number;

    @Prop({ required: true })
    gender: string;

    @Prop({ required: true })
    condition: string;

    @Prop({ required: true })
    observation: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ trim: true })
    appointmentId?: string;

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;
}

export const PatientRecordSchema = SchemaFactory.createForClass(PatientRecord);
