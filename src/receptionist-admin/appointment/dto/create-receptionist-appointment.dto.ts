import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength,IsBoolean,IsDate, IsOptional } from "class-validator";

export class CreateReceptionistAppointmentDto{
    @ApiProperty({
        description:'Patient Name',
        example:'Rahul Verma'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    patientName:string


    @ApiProperty({
        description:"patient age",
        example:"25"
    })
    @IsNumber()
    @IsNotEmpty()
    age:number

    @ApiProperty({
        description:"patient gender",
        example:"male"
    })
    @IsString()
    @IsNotEmpty()
    gender:string


    @ApiProperty({
        description:"doctor name",
        example:"Dr.Rahul"
    })
    @IsString()
    @IsNotEmpty()
    doctorName:string


    @ApiProperty({
        description:"checkup type",
        example:"General checkup"
    })
    @IsString()
    @IsNotEmpty()
    checkupType:string

    @ApiProperty({
        description:"date",
        example:"2022-01-01"
    })
    @IsDate()
    @IsNotEmpty()
    date:Date

    @ApiProperty({
        description:"time",
        example:"10:00"
    })
    @IsString()
    @IsNotEmpty()
    time:string

    @ApiProperty({
        description:"phone",
        example:"9876543210"
    })
    @IsNumber()
    @IsNotEmpty()
    phone:number

    @ApiProperty({
        description:"isActive",
        example:true
    })
    @IsBoolean()
    @IsNotEmpty()
    isActive:boolean

    @ApiProperty({
        description:"visitReason",
        example:"General checkup"
    })
    @IsString()
    @IsNotEmpty()
    visitReason:string

    @ApiPropertyOptional({
        description: "Hospital ID",
        example: "60c72b2f9b1e8a001c8e4e1a"
    })
    @IsString()
    @IsOptional()
    hospitalId?: string;
}
    

    
