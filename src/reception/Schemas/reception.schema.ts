import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";



export type ReceptionDocument = HydratedDocument<Reception>

@Schema({
    timestamps: true,
    collection: 'receptionists',
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export class Reception {
    @Prop({ required: true, trim: true, unique: true })
    name: string

    @Prop({ required: true, trim: true })
    age: number

    @Prop({ required: true, trim: true })
    gender: string

    @Prop({ required: true, trim: true })
    education: string

    @Prop({ required: true, trim: true, unique: true, lowercase: true })
    email: string

    @Prop({ required: true, trim: true, unique: true })
    phone: number

    @Prop({ required: true, trim: true, unique: true })
    password: string

    @Prop({ default: true })
    isReceptionist: boolean

    @Prop({ type: String, trim: true, index: true })
    hospitalId?: string;
}

export const ReceptionSchema = SchemaFactory.createForClass(Reception);