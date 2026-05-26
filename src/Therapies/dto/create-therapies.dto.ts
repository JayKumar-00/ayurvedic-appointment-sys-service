import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTherapiesDto{
    @ApiProperty({
        description:'Therapy Name',
        example:'Panchkarma'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    therapy:string


    @ApiProperty({
        description:"Duration",
        example:"60"
    })
    @IsNumber()
    @IsNotEmpty()
    duration:number

    @ApiProperty({
        description:"Type",
        example:"oil"
    })
    @IsString()
    @IsNotEmpty()
    type:string


    @ApiProperty({
        description:"frequency",
        example:"Daily"
    })
    @IsString()
    @IsNotEmpty()
    frequency:string


    @ApiProperty({
        description:"Price",
        example:"500"
    })
    @IsNumber()
    @IsNotEmpty()
    price:number

    @ApiProperty({
        description:"Difficulty",
        example:"easy"
    })
    @IsString()
    @IsNotEmpty()
    difficulty:string

    @ApiProperty({
        description:"Description of the therapy",
        example:"This is a test therapy"
    })
    @IsString()
    @IsNotEmpty()
    description:string

    @ApiPropertyOptional({
        description:"Hospital ID (only for system admin)",
        example:"60c72b2f9b1e8a001c8e4e1a"
    })
    @IsString()
    @IsOptional()
    hospitalId?:string
}