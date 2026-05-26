import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type InventoryDocument=HydratedDocument<Inventory>
@Schema({
    timestamps:true,
    collection:"inventories",
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

export class Inventory{
    @Prop({required:true, trim:true})
    name:string

    @Prop({required:true,trim:true})
    quantity:number

    @Prop({required:true,trim:true})
    unit:string

    @Prop({required:true , trim:true})
    manufacturer:string

    @Prop({required:true,trim:true})
    price:number

    @Prop({required:true})
    date:Date

    @Prop({required:true})
    assignedtoDisease:string


}

export const InventorySchema=SchemaFactory.createForClass(Inventory)
