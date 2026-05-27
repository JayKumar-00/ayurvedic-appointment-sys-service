import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";



export type MedicineDispensingDocument= HydratedDocument<MedicineDispensing>

@Schema({
    timestamps:true,
    collection:'medicine-Dispensings',
    toJSON:{virtuals:true,},
    toObject:{virtuals:true,}
})

export class MedicineDispensing {
    @Prop({required:true,trim:true})
    patientName:string

    @Prop({required:true})
    phone:number

    @Prop({required:true})
    doctorDiagnosis:string

    @Prop({required:true})
    medicineName:string

    @Prop({required:true})
    dosage:string

    @Prop({required:true})
    frequency:string

    @Prop({required:true})
    duration:string

    @Prop({required:true})
    notes:string

    @Prop({ default: false })
    status: boolean

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;

}

export const MedicineDispensingsSchema=SchemaFactory.createForClass(MedicineDispensing)