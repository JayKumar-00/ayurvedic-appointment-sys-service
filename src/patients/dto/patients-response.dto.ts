import {ApiProperty} from '@nestjs/swagger';

export class PatientsResponseDto{
    @ApiProperty({example:'662e4e2f3d3e3a3f3d3e3a3f'})
    _id:string;

    @ApiProperty({example:'Rajesh Kumar'})
    name:string;

    @ApiProperty({example:'rajesh@gmail.com'})
    email:string;

    @ApiProperty({example:'9876543210'})
    phone:number;

    @ApiProperty({example:'Male'})
    gender:string;

    @ApiProperty({example:'25'})
    age:number;

    @ApiProperty({example:'O+'})
    bloodGroup:string;

    @ApiProperty({example:'2022-01-01'})
    appointmentDate:Date;

    @ApiProperty({example:true})
    isActive:boolean;

    @ApiProperty({example:'647f12345678901234567890'})
    hospitalId?: string;
}