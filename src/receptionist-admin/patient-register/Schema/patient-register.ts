import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose";

export type PatientRegisterDocument = HydratedDocument<PatientRegister>

@Schema({
    timestamps:true,
    collection:'PatientRegister',
    toJSON:{ virtuals:true },
    toObject:{ virtuals:true }

})

export class PatientRegister {
    @Prop({
        required:true,
        trim:true
    })
    fullName:string

    @Prop({
        required:true
    })
    email:string

    @Prop({
        required:true
    })
    phone:number

    @Prop({
        required:true
    })
    age:number

    @Prop({
        required:true
    })
    gender:string

    @Prop({
        required:true
    })
    bloodGroup:string

    @Prop({
        required:true
    })
    status:boolean

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;
}
export const PatientRegisterSchema = SchemaFactory.createForClass(PatientRegister)