import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Inventory, InventorySchema } from "./Schema/inventory";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";

@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([{name:Inventory.name, schema:InventorySchema}]),
    ],
    controllers:[InventoryController],
    providers:[InventoryService,AdminLevelGuard],
    exports:[InventoryService]
})
export class InventoryModule{}