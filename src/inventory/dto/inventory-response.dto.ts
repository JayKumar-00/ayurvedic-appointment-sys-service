import { ApiProperty } from "@nestjs/swagger";

export class InventoryResponseDto{
    @ApiProperty({
        description:'id',
        example:1
    })
    _id:string;

    @ApiProperty({
        description:'name',
        example:'Ashwagandha'
    })
    name:string;

    @ApiProperty({
        description:'quantity',
        example:200
    })
    quantity:number;

    @ApiProperty({
        description:'unit',
        example:'grams'
    })
    unit:string;

    @ApiProperty({
        description:'manufacturer',
        example:'Patanjali'
    })
    manufacturer:string;

    @ApiProperty({
        description:'price',
        example:200
    })
    price:number;

    @ApiProperty({
        description:'date',
        example:'2022-01-01'
    })
    date:Date;

    @ApiProperty({
        description:'assignedtoDisease',
        example:'Diabetes'
    })
    assignedtoDisease:string;
}