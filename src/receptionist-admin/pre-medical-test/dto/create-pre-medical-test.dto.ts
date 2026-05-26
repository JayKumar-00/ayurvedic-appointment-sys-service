import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePreMedicalTestDto {

    @ApiProperty({
        description:'Patient Name',
        example:'Jhon Doe'
    })
    @IsString()
    @IsNotEmpty()
    patientName: string;


    @ApiProperty({
        description:'Phone Number',
        example:9876543210,
    })
    @IsNumber()
    @IsNotEmpty()
    phone: number;

    @ApiProperty({
        description:'Weight',
        example:70,
    })
    @IsNumber()
    @IsNotEmpty()
    Weight: number;

    @ApiProperty({
        description:'Blood Pressure',
        example:'120',
    })
    @IsNumber()
    @IsNotEmpty()
    Bp: number;

    @ApiProperty({
        description:'Height',
        example:170,
    })
    @IsNumber()
    @IsNotEmpty()
    Height: number;

    @ApiProperty({
        description:'Spo2',
        example:98,
    })
    @IsNumber()
    @IsNotEmpty()
    spo2: number;

    @ApiProperty({
        description:'Blood Sugar',
        example:100,
    })
    @IsNumber()
    @IsNotEmpty()
    bloodSugar: number;

    @ApiProperty({
        description:'Pain Level',
        example:10,
    })
    @IsNumber()
    @IsNotEmpty()
    painLevel: number;

    @ApiProperty({
        description:'Pulse Rate',
        example:70,
    })
    @IsNumber()
    @IsNotEmpty()
    pulseRate: number;

    @ApiProperty({
        description:'Symptoms',
        example:'Fever,Cold,Cough',
    })
    @IsString()
    @IsNotEmpty()
    symptoms: string;

    @ApiProperty({
        description:'Allergies',
        example:'None',
    })
    @IsString()
    @IsNotEmpty()
    allergies: string;

    @ApiProperty({
        description:'Medication',
        example:'Paracetamol,Amoxicillin',
    })
    @IsString()
    @IsNotEmpty()
    medication: string;

    @ApiProperty({
        description:'Notes',
        example:'Patient is stable',
    })
    @IsString()
    @IsNotEmpty()
    notes: string;

    @ApiProperty({
        description:'Status',
        example:true,
    })
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;
}