import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateDiagnosisReportDto{

    @ApiProperty({
        description:'appointment ID',
        example:'60d5ecb8b392d40015f84d0b'
    })
    @IsNotEmpty()
    @IsString()
    appointmentId:string

    @ApiProperty({
        description:'patient name',
        example:'rahul sharma'
    })
    @IsNotEmpty()
    @IsString()
    patientName:string

    @ApiProperty({
        description:'patient age',
        example:25
    })
    @IsNotEmpty()
    @IsNumber()
    age:number

    @ApiProperty({
        description:'patient gender',
        example:'male'
    })
    @IsString()
    gender:string

    @ApiProperty({
        description:'date of diagnosis',
        example:new Date().toISOString()
    })
    @IsNotEmpty()
    date:Date

    @ApiProperty({
        description:'blood pressure',
        example:120
    })
    @IsNotEmpty()
    @IsNumber()
    Bp:number

    @ApiProperty({
        description:'blood sugar',
        example:100
    })
    @IsNotEmpty()
    @IsNumber()
    bloodSugar:number

    @ApiProperty({
        description:'weight of patient',
        example:70
    })
    @IsNotEmpty()
    @IsNumber()
    weight:number

    @ApiProperty({
        description:'condition of patient',
        example:'good'
    })
    @IsNotEmpty()
    @IsString()
    condition:string
    
    @ApiProperty({
        description:'symptoms of patient',
        example:'fever,cough'
    })
    @IsNotEmpty()
    @IsString()
    symptoms:string

    @ApiProperty({
        description:'observation of patient',
        example:'good'
    })
    @IsNotEmpty()
    @IsString()
    observation:string

    @ApiProperty({
        description:'medicine for patient',
        example:'paracetamol'
    })
    @IsNotEmpty()
    @IsString()
    medicine:string

    @ApiProperty({
        description:'follow up date',
        example:new Date().toISOString()
    })
    @IsNotEmpty()
    @IsString()
    followUp:string

    @ApiProperty({
        description:'therapy assigned to patient',
        example:'yoga'
    })
    @IsNotEmpty()
    @IsString()
    assignTherapy:string
    
}