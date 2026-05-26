import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { MaxLength, IsNotEmpty, IsString, IsDate, IsBoolean } from "class-validator";

export class CreateAssignmentDto{
    @ApiProperty({
        description:'Administrator name',
        example:'Dr. Rajesh Kumar'
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    Administrator:string;



    @ApiProperty({
        description:'Hospital Name',
        example:'City Hospital',
        required:true
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    Hospital:string;


    @ApiProperty({
        description:'Role',
        examples:['Primary Admin','Secondary Admin','manager']
        
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    Role:string;


    @ApiProperty({
        description:'Permission',
        examples:['Full Access','Limited Access','view only'],

    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    Permission:string;

    @ApiProperty({
        description:'Start Date',
        example:'2022-01-01'
    })
    @IsDate()
    @Type(()=>Date)
    @IsNotEmpty()
    StartDate:Date;

    @ApiProperty({
        description:'is Active',
        example:true
    })
    @IsBoolean()
    @IsNotEmpty()
    isActive:boolean;
    
}