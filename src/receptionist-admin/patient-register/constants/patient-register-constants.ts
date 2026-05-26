export const PATIENT_REGISTER_STATUS=[
    {key:'active',value:true},
    {key:'inactive',value:false},
]

export type PatientRegisterStatus=(typeof PATIENT_REGISTER_STATUS)[number];
