import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientQueueController } from './patient-queue.controller';
import { PatientQueueService } from './patient-queue.service';
import { PatientQueue, PatientQueueSchema } from './Schema/patient-queue.schema';
import { AuthModule } from 'src/auth/auth.module';
import { ReceptionLevelGuard } from 'src/auth/guards/reception-level.guard';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: PatientQueue.name, schema: PatientQueueSchema }
    ]),
  ],
  controllers: [PatientQueueController],
  providers: [PatientQueueService, ReceptionLevelGuard],
  exports: [PatientQueueService]
})
export class PatientQueueModule {}
