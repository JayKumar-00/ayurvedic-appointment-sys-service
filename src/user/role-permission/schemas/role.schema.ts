import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class RolePermission {
  @Prop({ required: true, trim: true })
  module!: string;

  @Prop({ default: false })
  create!: boolean;

  @Prop({ default: false })
  read!: boolean;

  @Prop({ default: false })
  update!: boolean;

  @Prop({ default: false })
  delete!: boolean;

  @Prop({ default: false })
  export!: boolean;

  @Prop({ default: false })
  report!: boolean;
}

export const RolePermissionSchema =
  SchemaFactory.createForClass(RolePermission);

export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true,
    trim: true,
  })
  hospitalId!: Types.ObjectId;

  @Prop({ type: [RolePermissionSchema], default: [] })
  permissions!: RolePermission[];

  @Prop({ default: true, index: true })
  isActive!: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
RoleSchema.index({ hospitalId: 1, name: 1 }, { unique: true });
