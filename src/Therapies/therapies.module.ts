import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { AdminLevelGuard } from "src/user/admin-user/guards/admin-level.guard";
import { AdminUser, AdminUserSchema } from "src/user/admin-user/schemas/admin-user.schema";
import { Therapies, TherapiesSchema } from "./Schemas/therapies.schema";
import { TherapiesService } from "./therapies.service";
import { TherapiesController } from "./therapies.controller";

@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:Therapies.name,schema:TherapiesSchema},
            {name:AdminUser.name,schema:AdminUserSchema}
        ])
    ],
    controllers:[TherapiesController],
    providers:[TherapiesService,AdminLevelGuard],
    exports:[TherapiesService]
})

export class TherapiesModule{}
