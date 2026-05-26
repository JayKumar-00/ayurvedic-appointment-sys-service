import { Prop, Schema,SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PatientDocument = HydratedDocument<Patients>

@Schema({
    timestamps:true,
    collection:"patients",
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export class Patients{
     @Prop({required:true,trim:true,unique:true})
    name:string

    @Prop({required:true,trim:true,unique:true})
    email:string

    @Prop({required:true,})
    phone:number

    @Prop({required:true})
    gender:string

    @Prop({required:true})
    age:number

    @Prop({required:true})
    bloodGroup:string

    @Prop({required:true})
    appointmentDate:Date

    @Prop({required:true})
    isActive:boolean

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;
}

export const PatientsSchema = SchemaFactory.createForClass(Patients);
