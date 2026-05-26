import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { Reception, ReceptionSchema } from "./Schemas/reception.schema";
import { AdminUser, AdminUserSchema } from "src/user/admin-user/schemas/admin-user.schema";
import { ReceptionService } from "./reception.service";
import { ReceptionController } from "./reception.controller";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";







@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:Reception.name,schema:ReceptionSchema},
            {name:AdminUser.name,schema:AdminUserSchema}
        ])
    ],
    controllers:[ReceptionController],
    providers:[ReceptionService,AdminLevelGuard],
    exports:[ReceptionService]
})
export class ReceptionModule{}