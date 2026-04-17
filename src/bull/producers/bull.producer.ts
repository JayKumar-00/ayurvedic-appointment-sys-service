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

  addReminderJob(data: ReminderJobData) {
    return this.appointmentQueue.add('send-reminder', data, {
      ...BULL_DEFAULT_JOB_OPTIONS,
    });
  }
}
