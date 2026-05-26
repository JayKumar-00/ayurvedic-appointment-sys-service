import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";

export class UpdatePatientsDto{
    @ApiPropertyOptional({
    description:'name',
    example:'Priya Sharma'
    })
    @IsOptional()
    @IsString()
    name:string;

    @ApiPropertyOptional({
    description:'email',
    example:'priya@gmail.com'
    })
    @IsOptional()
    @IsEmail()
    email:string;

    @ApiPropertyOptional({
        description:'phone',
        example:'1234567890'
    })
    @IsOptional()
    @IsNumber()
    phone:number;

    @ApiPropertyOptional({
        description:'gender',
        example:'Male'
    })
    @IsOptional()
    @IsString()
    gender:string;

    @ApiPropertyOptional({
        description:'age',
        example:'25'
    })
    @IsOptional()
    @IsNumber()
    age:number;

    @ApiPropertyOptional({
        description:'bloodGroup',
        example:'O+'
    })
    @IsOptional()
    @IsString()
    bloodGroup:string;

    @ApiPropertyOptional({
        description:'appointmentDate',
        example:'2022-01-01'
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    appointmentDate:Date;

    @ApiPropertyOptional({
        description:'isActive',
        example:true
    })
    @IsOptional()
    @IsBoolean()
    isActive:boolean;
}
