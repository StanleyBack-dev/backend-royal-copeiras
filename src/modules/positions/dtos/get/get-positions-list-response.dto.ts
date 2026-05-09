import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetPositionsResponseDto } from "./get-positions-response.dto";

export const GetPositionsListResponseDto = createListResponseDto(
  GetPositionsResponseDto,
  "GetPositionsListResponseDto",
);
