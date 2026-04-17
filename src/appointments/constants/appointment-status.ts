export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
