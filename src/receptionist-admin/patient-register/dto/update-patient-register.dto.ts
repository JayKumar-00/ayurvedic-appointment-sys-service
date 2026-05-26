import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, IsBoolean } from "class-validator";

export class UpdatePatientRegisterDto {
    @ApiPropertyOptional({
        description: "patient name (optional)",
        example: "Priya"
    })
    @IsOptional()
    @IsString() 
    fullName?: string;

    @ApiPropertyOptional({
        description: "patient email (optional)",
        example: "priya@gmail.com"
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: "patient phone number (optional)",
        example: 9876543210
    })
    @IsOptional()
    @IsNumber()
    phone?: number;

    @ApiPropertyOptional({
        description: "age (optional)",
        example: 25
    })
    @IsOptional()
    @IsNumber()
    age?: number;

    @ApiPropertyOptional({
        description: "Gender (optional)",
        example: "female"
    })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiPropertyOptional({
        description: "BloodGroup(optional)",
        example: "A+"
    })
    @IsOptional()
    @IsString()
    bloodGroup?: string;

    @ApiPropertyOptional({
        description: "status (optional)",
        example: true
    })
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}