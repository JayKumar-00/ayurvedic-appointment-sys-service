import { ApiProperty } from "@nestjs/swagger";
import { InventoryResponseDto } from "./inventory-response.dto";
import { PaginationMetaDto } from "src/user/admin-user/dto/pagination-meta.dto";

export class InventoryListResponseDto{
    @ApiProperty({type:[InventoryResponseDto]})
    data:InventoryResponseDto[]

    @ApiProperty({type:PaginationMetaDto})
    meta:PaginationMetaDto
}
    