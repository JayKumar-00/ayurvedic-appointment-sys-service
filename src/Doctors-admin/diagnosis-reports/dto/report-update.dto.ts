import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional,IsString,IsNumber,IsDate } from "class-validator";

export class UpdateDiagnosisReportDto{
    @ApiPropertyOptional({example:'60d5ecb8b392d40015f84d0b'})
    @IsString()
    @IsOptional()
    appointmentId?:string

    @ApiPropertyOptional({example:'rahul sharma'})
    @IsString()
    @IsOptional()
    patientName?:string

    @ApiPropertyOptional({example:25})
    @IsNumber()
    @IsOptional()
    age?:number

    @ApiPropertyOptional({example:'male'})
    @IsString()
    @IsOptional()
    gender?:string

    @ApiPropertyOptional({example:new Date().toISOString()})
    @IsDate()
    @IsOptional()
    date?:Date

    @ApiPropertyOptional({example:120})
    @IsNumber()
    @IsOptional()
    Bp?:number

    @ApiPropertyOptional({example:100})
    @IsNumber()
    @IsOptional()
    bloodSugar?:number

    @ApiPropertyOptional({example:70})
    @IsNumber()
    @IsOptional()
    weight?:number

    @ApiPropertyOptional({example:'good'})
    @IsString()
    @IsOptional()
    condition?:string
    
    @ApiPropertyOptional({example:'fever,cough'})
    @IsString()
    @IsOptional()
    symptoms?:string

    @ApiPropertyOptional({example:'good'})
    @IsString()
    @IsOptional()
    observation?:string

    @ApiPropertyOptional({example:'paracetamol'})
    @IsString()
    @IsOptional()
    medicine?:string

    @ApiPropertyOptional({example:new Date().toISOString()})
    @IsString()
    @IsOptional()
    followUp?:string

    @ApiPropertyOptional({example:'yoga'})
    @IsString()
    @IsOptional()
    assignTherapy?:string
    
}