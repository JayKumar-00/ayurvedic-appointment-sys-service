import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";






export type DoctorDocument = HydratedDocument<Doctor>

@Schema({
    timestamps:true,
    collection:"doctors",
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
export class Doctor{
    @Prop({required:true,trim:true,unique:true})
    name:string

    @Prop({required:true,trim:true})
    specialization:string

    @Prop({required:true,trim:true})
    summary:string

    @Prop({required:true,trim:true,unique:true})
    email:string

    @Prop({required:true,trim:true,unique:true})
    phone:number

    @Prop({required:true,trim:true})
    experience:number

    @Prop({required:true})
    availableDays:string

    @Prop({required:true})
    availableTime:string

    @Prop({required:true,trim:true,unique:true})
    password:string

    @Prop({default:true})
    isDoctor:boolean
    
    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;
}


export const DoctorSchema=SchemaFactory.createForClass(Doctor)

