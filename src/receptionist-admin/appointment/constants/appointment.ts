export const APPOINTMENT_STATUS = [
    {key:"PENDING", value:"Pending"},
    {key:"CONFIRMED", value:"Confirmed"},
    {key:"CANCELLED", value:"Cancelled"},
    {key:"RESCHEDULED", value:"Rescheduled"},
    {key:"COMPLETED", value:"Completed"},
];
export type ReceptionistAppointmentStatus=(typeof APPOINTMENT_STATUS)[number]