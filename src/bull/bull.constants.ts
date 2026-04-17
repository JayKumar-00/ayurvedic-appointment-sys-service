export const BULL_REDIS_CONNECTION = 'BULL_REDIS_CONNECTION';
export const NOTIFICATION_QUEUE = 'notificationQueue';
export const APPOINTMENT_QUEUE = 'appointmentQueue';

export const BULL_DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: true,
  removeOnFail: false,
};
