export const APPOINTMENT_TYPE = [
  'Pending',
  'Confirmed',
  'Cancelled',
];

export type AppointmentType = (typeof APPOINTMENT_TYPE)[number];