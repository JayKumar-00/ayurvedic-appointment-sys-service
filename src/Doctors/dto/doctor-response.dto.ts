import { ApiProperty } from "@nestjs/swagger";



export class DoctorResponseDto{
    @ApiProperty({example:'666233872ewqeqwd35'})
    _id:string

    @ApiProperty({example:'Dr.Priya'})
    name:string
    
    @ApiProperty({example:'Cardiology'})
    specialization:string

    @ApiProperty({example:'Dr.priya Specialization in cardiology.....'})
    summary:string

    @ApiProperty({example:'[EMAIL_ADDRESS]'})
    email:string

    @ApiProperty({example:9876543210})
    phone:number

    @ApiProperty({example:10})
    experience:number

    @ApiProperty({example:'Monday to Saturday'})
    availableDays:string

    @ApiProperty({example:'9am to 5pm'})
    availableTime:string

    @ApiProperty({example:'123@priya'})
    password:string

    @ApiProperty({example:'647f12345678901234567890'})
    hospitalId?: string;
}