import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsEmail, IsNumber, IsOptional, IsString,IsBoolean } from "class-validator";

export class UpdateReceptionDto{
    @ApiPropertyOptional({
        description:"patient name (optional)",
        example:"Priya"
    })
    @IsOptional()
    @IsString() 
    patientName?:string

    @ApiPropertyOptional({
        description:"patient age (optional)",
        example:"25"
    })
     @IsOptional()
    @IsNumber()
    age?:number

    @ApiPropertyOptional({
        description:" patient gender (optional)",
        example:"female"
    })
     @IsOptional()
    @IsString()
    gender?:string

    @ApiPropertyOptional({
        description:"doctor name (optional)",
        example:"Dr.Rahul"
    })
     @IsOptional()
    @IsString()
    doctorName?:string

    @ApiPropertyOptional({
        description:"checkup type (optional)",
        example:"General checkup"
    })
     @IsOptional()
     @IsString()
    checkupType?:string

    @ApiPropertyOptional({
        description:"Date (optional)",
        example:"2022-01-01"
    })
     @IsOptional()
     @IsDate()
    date?:Date


    @ApiPropertyOptional({
        description:"time (optional)",
        example:"10:00"
    })
     @IsOptional()
     @IsString()
    time?:string

    @ApiPropertyOptional({
        description:"Phone number (optional)",
        example:"9876543210"
    })
     @IsOptional()
    @IsNumber()
    phone?:number

    @ApiPropertyOptional({
        description:"IsActive (optional)",
        example:true
    })
    @IsOptional()
    @IsBoolean()
    isActive?:boolean 
    
    @ApiPropertyOptional({
        description:"VisitReason (optional)",
        example:"General checkup"
    })
    @IsOptional()
    @IsString()
    visitReason?:string   
}