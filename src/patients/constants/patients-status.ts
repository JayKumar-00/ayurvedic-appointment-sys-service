export const PATIENTS_STATUS = [
    "Active",
    "Inactive",
    "Pending"
]
export type PatientStatus = (typeof PATIENTS_STATUS)[number];