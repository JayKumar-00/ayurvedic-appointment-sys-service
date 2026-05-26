import { ApiProperty } from "@nestjs/swagger";
import { PatientsResponseDto} from "./patients-response.dto";
import { PaginationMetaDto } from "src/user/admin-user/dto/pagination-meta.dto";

export class PatientsListResponseDto{
    @ApiProperty({type:[PatientsResponseDto]})
    data:PatientsResponseDto[]

    @ApiProperty({type:PaginationMetaDto})
    meta:PaginationMetaDto
}