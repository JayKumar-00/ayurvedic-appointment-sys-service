export const MEDICINE_DISPENSING_STATUS = {
    pending: 'pending',
    success: 'success',
    cancelled: 'cancelled'
}
export type MedicineDispensingStatusType = (typeof MEDICINE_DISPENSING_STATUS)[keyof typeof MEDICINE_DISPENSING_STATUS]