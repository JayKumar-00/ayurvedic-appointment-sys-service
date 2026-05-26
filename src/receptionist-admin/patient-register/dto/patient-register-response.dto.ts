import { ApiProperty } from "@nestjs/swagger";



export class PatientRegisterResponseDto{
    @ApiProperty({example:'666233872ewqeqwd35'})
    _id:string

    @ApiProperty({example:'Priya'})
    fullName:string
    
    @ApiProperty({example:'priya@gmail.com'})
    email:string

    @ApiProperty({example:'9123456789'})
    phone:number

    @ApiProperty({example:'25'})
    age:number

    @ApiProperty({example:'Female'})
    gender:string

    @ApiProperty({example:'A+'})
    bloodGroup:string

    @ApiProperty({example:'active'})
    status:boolean
}