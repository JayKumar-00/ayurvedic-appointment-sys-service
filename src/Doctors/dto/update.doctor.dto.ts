import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";





export class UpdateDoctorDto{
    @ApiPropertyOptional({
        description:"Name (optional)",
        example:"Dr.Priya Sharma"
    })
    @IsOptional()
    @IsString()
    name?:string

    @ApiPropertyOptional({
        description:"Specialization (optional)",
        example:"Cardiology"
    })
     @IsOptional()
    @IsString()
    specialization?:string

    @ApiPropertyOptional({
        description:"Summary (optional)",
        example:"Dr.priya Specialization in cardiology....."
    })
     @IsOptional()
    @IsString()
    summary?:string

    @ApiPropertyOptional({
        description:"Email (optional)",
        example:"[EMAIL_ADDRESS]"
    })
     @IsOptional()
    @IsString()
    email?:string

    @ApiPropertyOptional({
        description:"Phone (optional)",
        example:"9876543210"
    })
     @IsOptional()
     @IsNumber()
    phone?:number

    @ApiPropertyOptional({
        description:"Experience (optional)",
        example:"10"
    })
     @IsOptional()
    @IsNumber()
    experience?:number


    @ApiPropertyOptional({
        description:"Available days (optional)",
        example:"Monday to Saturday"
    })
     @IsOptional()
    @IsString()
    availableDays?:string

    @ApiPropertyOptional({
        description:"Available Time (optional)",
        example:"9am to 5pm"
    })
     @IsOptional()
    @IsString()
    availableTime?:string

    @ApiPropertyOptional({
        description:"Password (optional)",
        example:"123@priya"
    })
     @IsOptional()
    @IsString()
    password?:string

}