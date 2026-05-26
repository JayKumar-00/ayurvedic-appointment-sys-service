import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DiagnosisReportDocument=HydratedDocument<DiagnosisReport>
@Schema({
    timestamps:true,
    collection:"diagnosis-reports",
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export class DiagnosisReport{
    @Prop({required:true,trim:true,unique:true})
    appointmentId:string

    @Prop({required:true,trim:true})
    patientName:string

    @Prop({required:true})
    age:number

    @Prop({required:true})
    gender:string

    @Prop({required:true})
    date:Date

    @Prop({required:true})
    Bp:number

    @Prop({required:true})
    bloodSugar:number

    @Prop({required:true})
    weight:number

    @Prop({required:true})
    condition:string
    
    @Prop({required:true})
    symptoms:string

    @Prop({required:true})
    observation:string

    @Prop({required:true})
    medicine:string

    @Prop({required:true})
    followUp:string

    @Prop({required:true})
    assignTherapy:string

}
export const DiagnosisReportSchema=SchemaFactory.createForClass(DiagnosisReport);
