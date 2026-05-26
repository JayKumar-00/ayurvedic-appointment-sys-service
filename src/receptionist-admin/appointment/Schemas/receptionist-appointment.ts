import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";



export type ReceptionistAppointmentDocument = HydratedDocument<ReceptionistAppointment>

@Schema({
    timestamps: true,
    collection: 'receptionist-appointments',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export class ReceptionistAppointment {
    @Prop({ required: true, trim: true })
    patientName: string

    @Prop({required:true})
    age:number

    @Prop({required:true})
    gender:string

    @Prop({ required: true, trim: true })
    doctorName: string

    @Prop({ required: true, trim: true })
    checkupType:string

    @Prop({ required: true, trim: true })
    date: Date

    @Prop({ required: true, trim: true,})
    time: string

    @Prop({ required: true, trim: true,})
    phone: number

    @Prop({ required: true, trim: true,})
    isActive: boolean

    @Prop({required:true,trim:true})
    visitReason:string


}

export const ReceptionistAppointmentSchema = SchemaFactory.createForClass(ReceptionistAppointment);