import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AdminUserDocument = HydratedDocument<AdminUser>;

@Schema({ timestamps: true, collection: 'users' })
export class AdminUser {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ required: true, trim: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ trim: true, index: true })
  roleId?: string;

  @Prop({ index: true })
  hospitalId?: string;

  @Prop({ default: false, index: true })
  isAdmin!: boolean;

  @Prop({ default: false, index: true })
  isSystemAdmin!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  resetTokenHash?: string;

  @Prop()
  resetTokenExpiresAt?: Date;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
AdminUserSchema.index({ email: 1 }, { unique: true });
AdminUserSchema.index({ hospitalId: 1, isAdmin: 1 }, { unique: true });
