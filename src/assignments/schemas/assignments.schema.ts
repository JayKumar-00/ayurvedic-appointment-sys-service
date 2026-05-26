import { Prop,Schema,SchemaFactory } from "@nestjs/mongoose";
import {HydratedDocument,SchemaTypes,Types} from 'mongoose'
import {AssignmentStatus} from '../constants/assignment-status'

export type AssignmentDocument= HydratedDocument<Assignment>;

@Schema({
    timestamps: true,
    collection: 'assignments',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Assignment{
    @Prop({required:true,trim:true})
    Administrator:string

    @Prop({required:true,trim:true})
    Hospital:string

    @Prop({required:true})
    Role:string

    @Prop({required:true})
    Permission:string

    @Prop({required:true})
    StartDate:Date

    @Prop({required:true,default:false})
    isActive:boolean


}

export const AssignmentSchema=SchemaFactory.createForClass(Assignment)
   