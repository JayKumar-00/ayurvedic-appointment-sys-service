import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, type ConnectionOptions, type Job } from 'bullmq';
import { APPOINTMENT_QUEUE, BULL_REDIS_CONNECTION } from '../bull.constants';

@Injectable()
export class AppointmentProcessor implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;

  constructor(
    @Inject(BULL_REDIS_CONNECTION)
    private readonly connection: ConnectionOptions,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker(
      APPOINTMENT_QUEUE,
      async (job: Job) => {
        if (job.name !== 'send-reminder') {
          return { ignored: true };
        }

        return {
          processed: true,
          type: 'reminder',
          jobId: job.id,
          data: job.data,
          processedAt: new Date().toISOString(),
        };
      },
      {
        connection: this.connection,
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
