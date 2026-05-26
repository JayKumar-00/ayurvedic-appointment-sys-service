import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsBoolean, IsDate, IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
const toBoolean=({value}:{value:unknown})=>{
    if(typeof value ==='boolean')return value
    if(typeof value === 'string'){
        if(value.toLowerCase() === 'true') return true;
        if(value.toLowerCase() === 'false') return false;
    }
    return value;
}

export class AdminAppointmentFilterDto {

  @ApiPropertyOptional({ example: 'Raj', description:'Search by name , doctor, type , date, status'})
  @IsOptional()
  @IsString()
  search: string;

  @ApiPropertyOptional({example:'Rajesh Kumar',description:'filter by patient name'})
  @IsOptional()
  @IsString()
  patientName: string;

  @ApiPropertyOptional({example:'Dr. Sharma',description:'filter by doctor name'})
  @IsOptional()
  @IsString()
  doctorName: string;

  @ApiPropertyOptional({example:'OPD',description:'filter by appointment type'})
  @IsOptional()
  @IsString()
  type: string;

  @ApiPropertyOptional({example:'2022-01-01',description:'filter by appointment date'})
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiPropertyOptional({example:'10:00 AM',description:'filter by appointment time'})
  @IsOptional()
  @IsString()
  time: string;

  @ApiPropertyOptional({example:'true',description:'filter by appointment status'})
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ example: 1, description: 'filter by page number' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'filter by limit' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}