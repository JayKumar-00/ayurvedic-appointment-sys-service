import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, type ConnectionOptions, type Job } from 'bullmq';
import { BULL_REDIS_CONNECTION, NOTIFICATION_QUEUE } from '../bull.constants';

@Injectable()
export class NotificationProcessor implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker;

  constructor(
    @Inject(BULL_REDIS_CONNECTION)
    private readonly connection: ConnectionOptions,
  ) {}

  onModuleInit(): void {
    this.worker = new Worker(
      NOTIFICATION_QUEUE,
      async (job: Job) => {
        if (job.name !== 'send-notification') {
          return { ignored: true };
        }

        return {
          processed: true,
          type: 'notification',
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
