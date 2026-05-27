import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength, IsNumber, IsBoolean, IsOptional } from "class-validator";

export class CreatePatientRegisterDto {
    @ApiProperty({
        description: 'name of the patient',
        example: 'priya'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    fullName: string;

    @ApiProperty({
        description: 'email',
        example: 'priya@gmail.com'
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'phone number',
        example: 1234567890
    })
    @IsNumber()
    @IsNotEmpty()
    phone: number;

    @ApiProperty({
        description: 'age',
        example: 25
    })
    @IsNumber()
    @IsNotEmpty()
    age: number;

    @ApiProperty({
        description: 'gender',
        example: 'female'
    })
    @IsString()
    @IsNotEmpty()
    gender: string;

    @ApiProperty({
        description: 'blood group',
        example: 'A+ve'
    })
    @IsString()
    @IsNotEmpty()
    bloodGroup: string;

    @ApiProperty({
        description: 'status of patient',
        example: true
    })
    @IsBoolean()
    @IsNotEmpty()
    status: boolean;

    @ApiPropertyOptional({
        description: "Hospital ID",
        example: "60c72b2f9b1e8a001c8e4e1a"
    })
    @IsString()
    @IsOptional()
    hospitalId?: string;
}