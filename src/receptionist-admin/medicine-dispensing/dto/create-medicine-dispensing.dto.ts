import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateMedicineDispensingDto {
    @ApiProperty({
        description: 'Patient Name',
        example: 'Priya'
    })
    @IsString()
    @IsNotEmpty()
    patientName: string;

    @ApiProperty({
        description:'Phone Number',
        example:7894561230
    })
    @IsNumber()
    @IsNotEmpty()
    phone: number;

    @ApiProperty({
        description:'Doctor Diagnosis',
        example:'Fever'
    })
    @IsString()
    @IsNotEmpty()
    doctorDiagnosis: string;

    @ApiProperty({
        description:'Medicine Name',
        example:'Crocin'
    })
    @IsString()
    @IsNotEmpty()
    medicineName: string;

    @ApiProperty({
        description:'Dosage',
        example:'1 tablet'
    })
    @IsString()
    @IsNotEmpty()
    dosage: string;

    @ApiProperty({
        description:'Frequency',
        example:'3 times a day'
    })
    @IsString()
    @IsNotEmpty()
    frequency: string;

    @ApiProperty({
        description:'Duration',
        example:'5 days'
    })
    @IsString()
    @IsNotEmpty()
    duration: string;

    @ApiProperty({
        description:'Notes',
        example:'Take with food'
    })
    @IsString()
    @IsNotEmpty()
    notes: string;

    @ApiProperty({
        description:'Status',
        example:false
    })
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;
}