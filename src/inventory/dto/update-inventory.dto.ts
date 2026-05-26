import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDate, IsOptional,IsString,IsNumber } from "class-validator";

export class UpdateInventoryDto{
    @ApiPropertyOptional({
        description:'name',
        example:'Ashwagandha'
    })
    @IsOptional()
    @IsString()
    name:string;

    @ApiPropertyOptional({
        description:'quantity',
        example:200
    })
    @IsOptional()
    @IsNumber()
    quantity:number;

    @ApiPropertyOptional({
        description:'unit',
        example:'grams'
    })
    @IsOptional()
    @IsString()
    unit:string;

    @ApiPropertyOptional({
        description:'manufacturer',
        example:'Patanjali'
    })
    @IsOptional()
    @IsString()
    manufacturer:string;

    @ApiPropertyOptional({
        description:'price',
        example:200
    })
    @IsOptional()
    @IsNumber()
    price:number;

    @ApiPropertyOptional({
        description:'date',
        example:'2022-01-01'
    })
    @IsOptional()
    @IsDate()
    date:Date;

    @ApiPropertyOptional({
        description:'assignedtoDisease',
        example:'Diabetes'
    })
    @IsOptional()
    @IsString()
    assignedtoDisease:string;
}
