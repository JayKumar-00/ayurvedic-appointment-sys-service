import { Inject, Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  APPOINTMENT_QUEUE,
  BULL_DEFAULT_JOB_OPTIONS,
  NOTIFICATION_QUEUE,
} from '../bull/bull.constants';
import {
  NotificationJobData,
  ReminderJobData,
} from '../bull/producers/bull.producer';

@Injectable()
export class QueuesService {
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
