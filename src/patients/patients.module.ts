import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { Patients, PatientsSchema } from './Schemas/patients.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AdminLevelGuard } from 'src/user/admin-user/guards/admin-level.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Patients.name, schema: PatientsSchema }]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService,AdminLevelGuard],
  exports: [PatientsService],
})
export class PatientsModule {}
