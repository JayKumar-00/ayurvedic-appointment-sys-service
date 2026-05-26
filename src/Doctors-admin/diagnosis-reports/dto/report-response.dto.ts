import { ApiProperty } from "@nestjs/swagger";

export class DiagnosisReportResponseDto{
    @ApiProperty({example:'9993098908209jjdihihd239'})
    _id:string

    @ApiProperty({example:'60d5ecb8b392d40015f84d0b'})
    appointmentId:string

    @ApiProperty({example:'rahul sharma'})
    patientName:string

    @ApiProperty({example:25})
    age:number

    @ApiProperty({example:'male'})
    gender:string

    @ApiProperty({example:new Date().toISOString()})
    date:Date

    @ApiProperty({example:120})
    Bp:number

    @ApiProperty({example:100})
    bloodSugar:number

    @ApiProperty({example:70})
    weight:number

    @ApiProperty({example:'good'})
    condition:string
    
    @ApiProperty({example:'fever,cough'})
    symptoms:string

    @ApiProperty({example:'good'})
    observation:string

    @ApiProperty({example:'paracetamol'})
    medicine:string

    @ApiProperty({example:new Date().toISOString()})
    followUp:string

    @ApiProperty({example:'yoga'})
    assignTherapy:string
    
}