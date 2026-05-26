import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "src/auth/auth.module";
import { MedicineDispensing, MedicineDispensingsSchema } from "./Schema/medicine-despensing";
import { ReceptionLevelGuard } from "src/auth/guards/reception-level.guard";
import { MedicineDispensingService } from "./medicine-dispensing.service";
import { MedicineDispensingController } from "./medicine-dispensing.controller";




@Module({
    imports:[
        AuthModule,
        MongooseModule.forFeature([
            {name:MedicineDispensing.name,schema:MedicineDispensingsSchema},
        ]),
    ],
    controllers:[MedicineDispensingController],
    providers:[MedicineDispensingService,ReceptionLevelGuard],
    exports:[MedicineDispensingService]
})

export class MedicineDispensingModule {}