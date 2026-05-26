import { ApiProperty } from "@nestjs/swagger";



export class ReceptionResponseDto{
    @ApiProperty({example:'666233872ewqeqwd35'})
    _id:string

    @ApiProperty({example:'Priya'})
    name:string
    
    @ApiProperty({example:'25'})
    age:number

    @ApiProperty({example:'Female'})
    gender:string

    @ApiProperty({example:'B.Sc'})
    education:string

    @ApiProperty({example:'priya@gmail.com'})
    email:string

    @ApiProperty({example:9123456789})
    phone:number

    @ApiProperty({example:'123@priya'})
    password:string

    @ApiProperty({example:'647f12345678901234567890'})
    hospitalId?: string;
}