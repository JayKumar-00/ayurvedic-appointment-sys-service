import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Queue, type ConnectionOptions } from 'bullmq';
import { ConfigService } from '../config/config.service';
import {
  APPOINTMENT_QUEUE,
  BULL_DEFAULT_JOB_OPTIONS,
  BULL_REDIS_CONNECTION,
  NOTIFICATION_QUEUE,
} from './bull.constants';
import { BullProducer } from './producers/bull.producer';
import { NotificationProcessor } from './processors/notification.processor';
import { AppointmentProcessor } from './processors/appointment.processor';

class BullModuleLifecycle implements OnModuleDestroy {
  constructor(
    @Inject(NOTIFICATION_QUEUE) private readonly notificationQueue: Queue,
    @Inject(APPOINTMENT_QUEUE) private readonly appointmentQueue: Queue,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await Promise.all([
      this.notificationQueue.close(),
      this.appointmentQueue.close(),
    ]);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: BULL_REDIS_CONNECTION,
      useFactory: (configService: ConfigService): ConnectionOptions => {
        return {
          host: configService.redisHost,
          port: configService.redisPort,
          username: configService.redisUsername,
          password: configService.redisPassword || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        };
      },
      inject: [ConfigService],
    },
    {
      provide: NOTIFICATION_QUEUE,
      useFactory: (connection: ConnectionOptions) => {
        return new Queue(NOTIFICATION_QUEUE, {
          connection,
          defaultJobOptions: BULL_DEFAULT_JOB_OPTIONS,
        });
      },
      inject: [BULL_REDIS_CONNECTION],
    },
    {
      provide: APPOINTMENT_QUEUE,
      useFactory: (connection: ConnectionOptions) => {
        return new Queue(APPOINTMENT_QUEUE, {
          connection,
          defaultJobOptions: BULL_DEFAULT_JOB_OPTIONS,
        });
      },
      inject: [BULL_REDIS_CONNECTION],
    },
    BullProducer,
    NotificationProcessor,
    AppointmentProcessor,
    BullModuleLifecycle,
  ],
  exports: [BULL_REDIS_CONNECTION, NOTIFICATION_QUEUE, APPOINTMENT_QUEUE, BullProducer],
})
export class BullModule {}
