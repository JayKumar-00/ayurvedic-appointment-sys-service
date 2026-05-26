import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdatePreMedicalTestDto{
    @ApiPropertyOptional({
        description:"patient name",
        example:"Priya"
    })
    @IsOptional()
    @IsString()
    patientName?:string

    @ApiPropertyOptional({
        description:"patient number",
        example:"1234567890"
    })
    @IsOptional()
    @IsNumber()
    phone?:number

    @ApiPropertyOptional({
        description:"weight",
        example:"60"
    })
    @IsOptional()
    @IsNumber()
    Weight?:number

    @ApiPropertyOptional({
        description:"bp",
        example:"120"
    })
    @IsOptional()
    @IsNumber()
    Bp?:number

    @ApiPropertyOptional({
        description:"height",
        example:"60"
    })
    @IsOptional()
    @IsNumber()
    Height?:number

    @ApiPropertyOptional({
        description:"spo2",
        example:"98"
    })
    @IsOptional()
    @IsNumber()
    spo2?:number

    @ApiPropertyOptional({
        description:"bloodSugar",
        example:"120"
    })
    @IsOptional()
    @IsNumber()
    bloodSugar?:number

    @ApiPropertyOptional({
        description:"painlevel",
        example:"10"
    })
    @IsOptional()
    @IsNumber()
    painLevel?:number

    @ApiPropertyOptional({
        description:"pulserate",
        example:"72"
    })
    @IsOptional()
    @IsNumber()
    pulseRate?:number

    @ApiPropertyOptional({
        description:"symptoms",
        example:"cough,cold"
    })
    @IsOptional()
    @IsString()
    symptoms?:string


    @ApiPropertyOptional({
        description:"allergies",
        example:"none"
    })
    @IsOptional()
    @IsString()
    allergies?:string

    @ApiPropertyOptional({
        description:"medication",
        example:"none"
    })
    @IsOptional()
    @IsString()
    medication?:string

    @ApiPropertyOptional({
        description:"notes",
        example:"needs to take medicine for 5 days"
    })
    @IsOptional()
    @IsString()
    notes?:string

    @ApiPropertyOptional({
        description:"status",
        example:true
    })
    @IsOptional()
    @IsBoolean()
    status?:boolean

    
}