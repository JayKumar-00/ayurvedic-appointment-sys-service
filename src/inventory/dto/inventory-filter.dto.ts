import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsOptional,IsString,IsNumber, IsDate, IsInt, Min, Max, IsIn } from "class-validator";

const toBoolean=({value}:{value:unknown})=>{
    if(typeof value ==='boolean')return value
    if(typeof value ==='string'){
        if(value.toLowerCase()==='true')return true;
        if(value.toLowerCase() === 'false')return false;
    }
    return value
}

export class InventoryFilterDto{
    @ApiPropertyOptional({
        example:'ashwagandha',
        description:'search across all fields'
    })
    @IsOptional()
    @IsString()
    search:string;

    @ApiPropertyOptional({example:'ashwagandha', description:'name of the medicine'})
    @IsOptional()
    @IsString()
    name:string;

    @ApiPropertyOptional({
        description:'Quantity',
        example:200
    })
    @IsOptional()
    @IsNumber()
    quantity:number;

    @ApiPropertyOptional({
        description:'Unit',
        example:'grams'
    })
    @IsOptional()
    @IsString()
    unit:string;

    @ApiPropertyOptional({
        description:'Manufacturer',
        example:'Patanjali'
    })
    @IsOptional()
    @IsString()
    manufacturer:string;

    @ApiPropertyOptional({
        description:'Price',
        example:200
    })
    @IsOptional()
    @IsNumber()
    price:number;

    @ApiPropertyOptional({
        description:'Date',
        example:'2022-01-01'
    })
    @IsOptional()
    @IsDate()
    date:Date;

    @ApiPropertyOptional({
        description:'Assigned to Disease',
        example:'Diabetes'
    })
    @IsOptional()
    @IsString()
    assignedtoDisease:string;

    @ApiPropertyOptional({
        example:1,default:1
    })
    @IsOptional()
    @Transform(({value})=> Number(value))
    @IsInt()
    @Min(1)
    page:number=1

    @ApiPropertyOptional({
        example:10 ,default:10
    })
    @IsOptional()
    @Transform(({value}) => Number(value))
    @IsInt()
    @Max(100)
    limit:number=10

    @ApiPropertyOptional({example:'createdAt',description:'sort field'})
    @IsOptional()
    @IsString()
    sortBy:string='createdAt';


    @ApiPropertyOptional({example:'desc',description:'sort order'})
    @IsOptional()
    @IsIn(['asc','desc'])
    sortOrder:'asc'| 'desc'= 'desc'

    @ApiPropertyOptional({
        description: 'Hospital ID filter',
        example: '60c72b2f9b1e8a001c8e4e1a'
    })
    @IsOptional()
    @IsString()
    hospitalId?: string;
}