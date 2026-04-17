import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshToken {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, index: true })
  expiresAt: Date;

  @Prop({ default: false, index: true })
  isRevoked: boolean;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
