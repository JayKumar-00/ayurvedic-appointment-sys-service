import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class MenuItem {
  @Prop({ required: true, trim: true })
  label!: string;

  @Prop({ required: true, trim: true })
  icon!: string;

  @Prop({ required: true, trim: true })
  view!: string;

  @Prop({ required: true, trim: true })
  href!: string;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

@Schema({ _id: false })
export class MenuSection {
  @Prop({ required: true, trim: true })
  sectionName!: string;

  @Prop({ type: [MenuItemSchema], default: [] })
  items!: MenuItem[];
}

export const MenuSectionSchema = SchemaFactory.createForClass(MenuSection);

export type SidebarMenuDocument = HydratedDocument<SidebarMenu>;

@Schema({ timestamps: true, collection: 'sidebar_menus' })
export class SidebarMenu {
  @Prop({ required: true, unique: true, trim: true })
  role!: string; // 'super-admin', 'admin', 'doctor', 'receptionist'

  @Prop({ type: [MenuSectionSchema], default: [] })
  sections!: MenuSection[];
}

export const SidebarMenuSchema = SchemaFactory.createForClass(SidebarMenu);
