import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { Transform, Type } from "class-transformer";

import { IsBoolean, IsEmail, IsIn,IsInt,IsNumber,IsOptional,IsString, Max,Min,IsDate} from "class-validator";

const toBoolean=({value}:{value:unknown})=>{
    if(typeof value ==='boolean')return value
    if(typeof value === 'string'){
        if(value.toLowerCase() === 'true') return true;
        if(value.toLowerCase() === 'false') return false;
    }
    return value;
}


export class PatientsFilterDto{
    @ApiPropertyOptional({example:'Raj', description:'Search across name,email,phone,gender,age,bloodGroup,appointmentDate, and isActive'})
    @IsOptional()
    @IsString()
    search:string;

    @ApiPropertyOptional({example:'Rajesh Kumar',description:'filter by name'})
    @IsOptional()
    @IsString()
    name:string;

    @ApiPropertyOptional({example:'[EMAIL_ADDRESS]',description:'filter by email'})
    @IsOptional()
    @IsEmail()
    email:string;


    @ApiPropertyOptional({example:'9876543210',description:'filter by phone number'})
    @IsOptional()
    @IsNumber()
    phone:number;

    @ApiPropertyOptional({example:'Male',description:'filter by gender'})
    @IsOptional()
    @IsString()
    gender:string


    @ApiPropertyOptional({example:'age',description:'filler by age'})
    @IsOptional()
    @IsNumber()
    age:number;


    @ApiPropertyOptional({example:'bloodGroup',description:'filter by blood group'})
    @IsOptional()
    @IsString()
    bloodGroup:string;

    @ApiPropertyOptional({example:'appointmentDate',description:'filter by appointment date'})
    @IsOptional()
    @IsDate()
    @Type(()=> Date)
    appointmentDate:Date;

    @ApiPropertyOptional({example:'isActive',description:'filter by isActive'})
    @IsOptional()
    @IsBoolean()
    isActive:boolean;

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