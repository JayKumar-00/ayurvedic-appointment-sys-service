import { ApiProperty } from "@nestjs/swagger";
import { AssignmentResponseDto} from "./assignment-response.dto";
import { PaginationMetaDto } from "src/user/admin-user/dto/pagination-meta.dto";

export class AssignmentListResponseDto{
    @ApiProperty({type:[AssignmentResponseDto]})
    data:AssignmentResponseDto[]

    @ApiProperty({type:PaginationMetaDto})
    meta:PaginationMetaDto
}
