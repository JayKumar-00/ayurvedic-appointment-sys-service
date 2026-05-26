import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";



export class TherapiesResponseDto{
    @ApiProperty({example:'666233872ewqeqwd35'})
    _id:string

    @ApiProperty({example:'Panchkarma'})
    therapy:string
    
    @ApiProperty({example:'25'})
    duration:number

    @ApiProperty({example:'Ayurvedic'})
    type:string

    @ApiProperty({example:'Daily'})
    frequency:string

    @ApiProperty({example:'500'})
    price:number

    @ApiProperty({example:"hard"})
    difficulty:string

    @ApiProperty({example:'This is a test therapy'})
    description:string

    @ApiPropertyOptional({example:'60c72b2f9b1e8a001c8e4e1a'})
    hospitalId?:string
}