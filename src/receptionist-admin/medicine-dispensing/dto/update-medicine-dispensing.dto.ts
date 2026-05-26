import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";





export class UpdateMedicineDispensingDto{
    @ApiPropertyOptional({
        description:'patient name (optional)',
        example:'priya'
    })
    @IsOptional()
    @IsString()
    patientName?:string


    @ApiPropertyOptional({
        description:'Phone number (optional)',
        example:'998877665'
    })
    @IsOptional()
    @IsNumber()
    phone?:number

    @ApiPropertyOptional({
        description:'doctorDiagnosis (optional)',
        example:'fever'
    })
    @IsOptional()
    @IsString()
    doctorDiagnosis?:string


    @ApiPropertyOptional({
        description:'medicine name (optional)',
        example:'paracetomol'
    })
    @IsOptional()
    @IsString()
    medicineName?:string

    @ApiPropertyOptional({
        description:'dosage (optional)',
        example:'50mg'
    })
    @IsOptional()
    @IsString()
    dosage?:string

    @ApiPropertyOptional({
        description:'frequency (optional)',
        example:'50mg'
    })
    @IsOptional()
    @IsString()
    frequency?:string

    @ApiPropertyOptional({
        description:'duration (optional)',
        example:'50mg'
    })
    @IsOptional()
    @IsString()
    duration?:string

    @ApiPropertyOptional({
        description:'notes (optional)',
        example:'paracetomol is good for fever'
    })
    @IsOptional()
    @IsString()
    notes?:string

    @ApiPropertyOptional({
        description:'status',
        example:false
    })
    @IsOptional()
    @IsBoolean()
    status?:boolean
    
}
