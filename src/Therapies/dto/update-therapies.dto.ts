import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString } from "class-validator";





export class UpdateTherapiesDto{
    @ApiPropertyOptional({
        description:"Therapy Name (optional)",
        example:"Panchkarma"
    })
    @IsOptional()
    @IsString()
    therapy?:string

    @ApiPropertyOptional({
        description:"Duration (optional)",
        example:"25"
    })
     @IsOptional()
    @IsNumber()
    duration?:number

    @ApiPropertyOptional({
        description:"type (optional)",
        example:"Ayurvedic"
    })
     @IsOptional()
    @IsString()
    type?:string

    @ApiPropertyOptional({
        description:"frequency (optional)",
        example:"Daily"
    })
     @IsOptional()
    @IsString()
    frequency?:string

    @ApiPropertyOptional({
        description:"price (optional)",
        example:"500"
    })
     @IsOptional()
    @IsNumber()
    price?:number

    @ApiPropertyOptional({
        description:"difficulty (optional)",
        example:"Hard"
    })
     @IsOptional()
    @IsString()
    difficulty?:string

    @ApiPropertyOptional({
        description:"description (optional)",
        example:"This is a test therapy"
    })
     @IsOptional()
    @IsString()
    description?:string    
}