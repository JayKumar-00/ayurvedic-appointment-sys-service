import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";





export type PreMedicalTestDocument = HydratedDocument<PreMedicalTest>

@Schema({
    timestamps: true,
    collection: 'preMedicalTest',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})


export class PreMedicalTest {
    @Prop({ required: true, trim: true })
    patientName:string;

    @Prop({required:true})
    phone:number

    @Prop({required:true})
    Weight:number

    @Prop({required:true})
    Bp:number
    
    @Prop({required:true})
    Height:number

    @Prop({required:true})
    spo2:number

    @Prop({required:true})
    bloodSugar:number

    @Prop({required:true})
    painLevel:number

    @Prop({required:true})
    pulseRate:number

    @Prop({required:true})
    symptoms:string
    
    @Prop({required:true})
    allergies:string

    @Prop({required:true})
    medication:string

    @Prop({required:true})
    notes:string

    @Prop({required:true})
    status:boolean

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;



}

export const PreMedicalTestSchema = SchemaFactory.createForClass(PreMedicalTest)

