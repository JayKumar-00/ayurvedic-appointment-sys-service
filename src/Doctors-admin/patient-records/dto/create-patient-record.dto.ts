import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";

export class CreatePatientRecordDto {
    @ApiProperty({
        description: 'patient name',
        example: 'rahul sharma'
    })
    @IsNotEmpty()
    @IsString()
    patientName: string;

    @ApiProperty({
        description: 'patient phone number',
        example: '9876543210'
    })
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty({
        description: 'patient age',
        example: 25
    })
    @IsNotEmpty()
    @IsNumber()
    age: number;

    @ApiProperty({
        description: 'patient gender',
        example: 'male'
    })
    @IsNotEmpty()
    @IsString()
    gender: string;

    @ApiProperty({
        description: 'condition of patient',
        example: 'Hypertension'
    })
    @IsNotEmpty()
    @IsString()
    condition: string;

    @ApiProperty({
        description: 'observation of patient',
        example: 'Blood pressure slightly high'
    })
    @IsNotEmpty()
    @IsString()
    observation: string;

    @ApiProperty({
        description: 'date of recording',
        example: new Date().toISOString()
    })
    @IsNotEmpty()
    date: Date;

    @ApiProperty({
        description: 'appointment ID',
        example: '60d5ecb8b392d40015f84d0b',
        required: false
    })
    @IsOptional()
    @IsString()
    appointmentId?: string;
}
