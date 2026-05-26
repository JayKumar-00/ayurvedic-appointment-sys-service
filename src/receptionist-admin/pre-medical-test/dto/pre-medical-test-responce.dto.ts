import { ApiProperty } from "@nestjs/swagger";


export class PreMedicalTestResponceDto {

    @ApiProperty({
        example:'123e4567-e89b-12d3-a456-426614174000',
    })
    _id:string;

    @ApiProperty({
        example:'Jhon Doe'
    })
    patientName: string;   

    @ApiProperty({
        example:9876543210,
    })
    phone: number;

    @ApiProperty({
        example:70,
    })
    Weight: number;

    @ApiProperty({
        example:'120/80',
    })
    Bp: string;

    @ApiProperty({
        example:170,
    })
    Height: number;

    @ApiProperty({
        example:98,
    })
    spo2: number;

    @ApiProperty({
        example:100,
    })
    bloodSugar: number;

    @ApiProperty({
        example:10,
    })
    painLevel: number;

    @ApiProperty({
        example:70,
    })
    pulseRate: number;

    @ApiProperty({
        example:'Fever,Cold,Cough',
    })
    symptoms: string;

    @ApiProperty({
        example:'None',
    })
    allergies: string;

    @ApiProperty({
        example:'Paracetamol,Amoxicillin',
    })
    medication: string;

    @ApiProperty({
        example:'Patient is stable',
    })
    notes: string;

    @ApiProperty({
        example:true,
    })
    status: boolean;
}