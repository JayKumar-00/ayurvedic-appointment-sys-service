import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumber, IsDate } from "class-validator";

export class CreateInventoryDto{
    @ApiProperty({
        description:'Name of the medicine',
        example:'Ashwagandha'
    })
    @IsNotEmpty()
    @IsString()
    name:string;

    @ApiProperty({
        description:'Quantity of the medicine',
        example:200
    })
    @IsNotEmpty()
    @IsNumber()
    quantity:number;

    @ApiProperty({
        description:'Unit of the medicine',
        example:'grams'
    })
    @IsNotEmpty()
    @IsString()
    unit:string;

    @ApiProperty({
        description:'Manufacturer of the medicine',
        example:'Patanjali'
    })
    @IsNotEmpty()
    @IsString()
    manufacturer:string;

    @ApiProperty({
        description:'Price of the medicine',
        example:200
    })
    @IsNotEmpty()
    @IsNumber()
    price:number;

    @ApiProperty({
        description:'Date of the medicine',
        example:'2022-01-01'
    })
    @IsNotEmpty()
    @IsDate()
    date:Date;

    @ApiProperty({
        description:'Assigned to disease',
        example:'Diabetes'
    })
    @IsNotEmpty()
    @IsString()
    assignedtoDisease:string;
}