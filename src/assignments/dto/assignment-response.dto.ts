import {ApiProperty} from '@nestjs/swagger';

export class AssignmentResponseDto{
    @ApiProperty({example:'662e4e2f3d3e3a3f3d3e3a3f'})
    _id:string;

    @ApiProperty({example:'Dr.Rajesh Kumar'})
    Administrator:string;

    @ApiProperty({example:'Suriya Hospital'})
    Hospital:string;

    @ApiProperty({example:'Manager'})
    Role:string;

    @ApiProperty({example:'Full Access'})
    Permission:string;

    @ApiProperty({example:'2022-01-01'})
    StartDate:Date;

    @ApiProperty({example:true})
    isActive:boolean;
}