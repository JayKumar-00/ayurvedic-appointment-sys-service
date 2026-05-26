import { ApiProperty } from "@nestjs/swagger";



export class ReceptionResponseDto{
    @ApiProperty({example:'666233872ewqeqwd35'})
    _id:string

    @ApiProperty({example:'Priya'})
    patientName:string
    
    @ApiProperty({example:'25'})
    age:number

    @ApiProperty({example:'Female'})
    gender:string

    @ApiProperty({example:'Dr. Kumar'})
    doctorName:string

    @ApiProperty({example:'General'})
    checkupType:string

    @ApiProperty({example:'2022-01-01'})
    date:Date

    @ApiProperty({example:'10:00'})
    time:string

    @ApiProperty({example:9123456789})
    phone:number

    @ApiProperty({example:true})
    isActive:boolean

    @ApiProperty({example:'General checkup'})
    visitReason:string
}