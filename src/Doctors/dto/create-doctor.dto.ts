import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, IsOptional } from "class-validator";

export class CreateDoctorDto{
    @ApiProperty({
        description:'Full Name',
        example:'Dr.Priya Sharma'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    name:string


    @ApiProperty({
        description:"Specialization",
        example:"Cardiology"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    specialization:string

    @ApiProperty({
        description:"Summary",
        example:"Dr.priya Specialization in cardiology....."
    })
    @IsString()
    @IsNotEmpty()
    summary:string


    @ApiProperty({
        description:"Email",
        example:"[EMAIL_ADDRESS]"
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email:string


    @ApiProperty({
        description:"Phone",
        example:"9876543210"
    })
    @IsNumber()
    @IsNotEmpty()
    phone:number

    @ApiProperty({
        description:"Experience",
        example:"10"
    })
    @IsNumber()
    @IsNotEmpty()
    experience:number

    @ApiProperty({
        description:"Available days",
        example:"Monday to Saturday"
    })
    @IsString()
    @IsNotEmpty()
    availableDays:string


    @ApiProperty({
        description:"Available Time",
        example:"9am to 5pm"
    })
    @IsString()
    @IsNotEmpty()
    availableTime:string

    @ApiProperty({
        description:"Password",
        example:"123456"
    })
    @IsString()
    @IsNotEmpty()
    password:string

    @ApiProperty({
        description: "Hospital ID",
        example: "647f12345678901234567890",
        required: false,
    })
    @IsString()
    @IsOptional()
    hospitalId?: string;
}