import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  APPOINTMENT_QUEUE,
  BULL_DEFAULT_JOB_OPTIONS,
  NOTIFICATION_QUEUE,
} from '../bull.constants';

export type NotificationJobData = {
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ReminderJobData = {
  appointmentId: string;
  userId: string;
  reminderAt?: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class BullProducer {
  constructor(
    @Inject(NOTIFICATION_QUEUE)
    private readonly notificationQueue: Queue,
    @Inject(APPOINTMENT_QUEUE)
    private readonly appointmentQueue: Queue,
  ) {}

  addNotificationJob(data: NotificationJobData) {
    return this.notificationQueue.add('send-notification', data, {
      ...BULL_DEFAULT_JOB_OPTIONS,
    });
  }

  addReminderJob(
    data: ReminderJobData,
    options?: { delay?: number; jobId?: string },
  ) {
    return this.appointmentQueue.add('send-reminder', data, {
      ...BULL_DEFAULT_JOB_OPTIONS,
      ...(options?.jobId ? { jobId: options.jobId } : {}),
      ...(options?.delay && options.delay > 0 ? { delay: options.delay } : {}),
    });
  }

  async removeReminderJob(jobId: string): Promise<void> {
    const job = await this.appointmentQueue.getJob(jobId);

    if (job) {
      await job.remove();
    }
  }
}
