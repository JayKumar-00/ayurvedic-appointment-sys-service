import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HospitalDocument = HydratedDocument<Hospital>;

@Schema({ timestamps: true, collection: 'hospitals' })
export class Hospital {
  @Prop({ required: true, trim: true, unique: true })
  name!: string;

  @Prop({ required: true, trim: true, unique: true })
  code!: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
