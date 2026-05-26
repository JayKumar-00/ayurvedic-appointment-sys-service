import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Transform } from "class-transformer";

import { IsBoolean, IsIn,IsInt,IsOptional,IsString, Max,Min} from "class-validator";

const toBoolean=({value}:{value:unknown})=>{
    if(typeof value ==='boolean')return value
    if(typeof value === 'string'){
        if(value.toLowerCase() === 'true') return true;
        if(value.toLowerCase() === 'false') return false;
    }
    return value;
}


export class AssignmentFilterDto{
    @ApiPropertyOptional({example:'Dr', description:'Search across administrator,hospital,role,permission,startdate, and status'})
    @IsOptional()
    @IsString()
    search:string;

    @ApiPropertyOptional({example:'Suriya Hospital',description:'filter by hospital name'})
    @IsOptional()
    @IsString()
    Hospital:string;


    @ApiPropertyOptional({example:'Dr.Raj',description:'filter by adminstator name'})
    @IsOptional()
    @IsString()
    Administrator:string;

    @ApiPropertyOptional({example:'Manager',description:'filter by role name'})
    @IsOptional()
    @IsString()
    Role:string


    @ApiPropertyOptional({example:'Full Access',description:'filler by permissions'})
    @IsOptional()
    @IsString()
    Permission:string;


    @ApiPropertyOptional({example:1 , default:1})
    @IsOptional()
    @Transform(({value})=> Number(value))
    @IsInt()
    @Min(1)
    page:number=1;


    @ApiPropertyOptional({example:10,default:10})
    @IsOptional()
    @Transform(({value})=> Number(value))
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
}