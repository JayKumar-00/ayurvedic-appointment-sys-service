import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateReceptionDto{
    @ApiPropertyOptional({
        description:"Name (optional)",
        example:"Priya"
    })
    @IsOptional()
    @IsString()
    name?:string

    @ApiPropertyOptional({
        description:"age (optional)",
        example:"25"
    })
     @IsOptional()
    @IsNumber()
    age?:number

    @ApiPropertyOptional({
        description:"gender (optional)",
        example:"female"
    })
     @IsOptional()
    @IsString()
    gender?:string

    @ApiPropertyOptional({
        description:"education (optional)",
        example:"Btech"
    })
     @IsOptional()
    @IsString()
    education?:string

    @ApiPropertyOptional({
        description:"Email (optional)",
        example:"Priya@gmail.com"
    })
     @IsOptional()
     @IsEmail()
    email?:string

    @ApiPropertyOptional({
        description:"Phone (optional)",
        example:"9876543210"
    })
     @IsOptional()
    @IsNumber()
    phone?:number

    @ApiPropertyOptional({
        description:"Password (optional)",
        example:"123456"
    })
     @IsOptional()
    @IsString()
    password?:string    
}