import { ApiProperty } from "@nestjs/swagger";



export class MedicineDispensingResponseDto {
    @ApiProperty({
        example:'334449099128732eiwoj'
    })
    _id:string;

    @ApiProperty({
        example:'priya'
    })
    patientName:string

    @ApiProperty({
        example:'987654789'
    })
    phone:number

    @ApiProperty({
        example:'fever'
    })
    doctorDiagnosis:string

    @ApiProperty({
        example:'crocin'
    })
    medicineName:string

    @ApiProperty({
        example:'1 tablet'
    })
    dosage:string

    @ApiProperty({
        example:'3 times a day'
    })
    frequency:string

    @ApiProperty({
        example:'5 days'
    })
    duration:string

    @ApiProperty({
        example:'take with food'
    })
    notes:string

    @ApiProperty({
        example:false
    })
    status:boolean

    @ApiProperty({
        example:'2024-01-01T00:00:00.000Z'
    })
    createdAt:Date

    @ApiProperty({
        example:'2024-01-01T00:00:00.000Z'
    })
    updatedAt:Date

    @ApiProperty({
        example:'60c72b2f9b1e8a001c8e4e1a'
    })
    hospitalId?:string;
}