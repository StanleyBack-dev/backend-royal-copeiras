import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetLeadsResponseDto } from "./get-leads-response.dto";

export const GetLeadsListResponseDto = createListResponseDto(
  GetLeadsResponseDto,
  "GetLeadsListResponseDto",
);
