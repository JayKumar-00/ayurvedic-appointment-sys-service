import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional,IsString,IsDate,IsBoolean, MaxLength } from "class-validator";


export class UpdateAssignmentDto{
    @ApiPropertyOptional({
    description:'Administrator name',
    example:'Dr.Priya Sharma'
    })
    @IsOptional()
    @IsString()
    Administrator:string

    @ApiPropertyOptional({
    description:'Hospital Name',
    example:'Suriya Hospital'
    })
    @IsOptional()
    @IsString()
    Hospital:string;

    @ApiPropertyOptional({
        description:'Role',
        example:'Manager'
    })
    @IsOptional()
    @IsString()
    Role:string;

    @ApiPropertyOptional({
        description:'Permission',
        example:'Full Access'
    })
    @IsOptional()
    @IsString()
    @MaxLength(2000)
    Permission:string;

    @ApiPropertyOptional({
        description:'Start Date',
        example:'2022-01-01'
    })
    @IsOptional()
    @IsDate()
    StartDate:Date;

    @ApiPropertyOptional({
        description:'Is Active',
        example:true
    })
    @IsOptional()
    @IsBoolean()
    isActive:boolean;
}
