import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, IsOptional } from "class-validator";

export class CreateReceptionDto{
    @ApiProperty({
        description:'Full Name',
        example:'Rahul Verma'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    name:string


    @ApiProperty({
        description:"age",
        example:"25"
    })
    @IsNumber()
    @IsNotEmpty()
    age:number

    @ApiProperty({
        description:"gender",
        example:"male"
    })
    @IsString()
    @IsNotEmpty()
    gender:string


    @ApiProperty({
        description:"education",
        example:"Btech"
    })
    @IsString()
    @IsNotEmpty()
    education:string


    @ApiProperty({
        description:"Email",
        example:"[EMAIL_ADDRESS]"
    })
    @IsEmail()
    @IsNotEmpty()
    email:string

    @ApiProperty({
        description:"phone",
        example:"9876543210"
    })
    @IsNumber()
    @IsNotEmpty()
    phone:number

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