import {Prop,Schema,SchemaFactory} from "@nestjs/mongoose";
import { HydratedDocument,Types } from "mongoose";



export type TherapiesDocument=HydratedDocument<Therapies>

@Schema({
    timestamps:true,
    collection:'therapies',
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export class Therapies{
    @Prop({required:true,trim:true})
    therapyName:string

    @Prop({required:true,trim:true})
    duration:number

    @Prop({required:true,trim:true})
    type:string

    @Prop({required:true,trim:true})
    frequency:string

    @Prop({required:true,trim:true})
    price:number

    @Prop({required:true,trim:true})
    difficulty:string

    @Prop({required:true,trim:true})
    description:string

    @Prop({index:true})
    hospitalId:string
}

export const TherapiesSchema=SchemaFactory.createForClass(Therapies);