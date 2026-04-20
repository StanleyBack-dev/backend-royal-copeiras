import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetContractsResponseDto } from "./get-contracts-response.dto";

export const GetContractsListResponseDto = createListResponseDto(
  GetContractsResponseDto,
  "GetContractsListResponseDto",
);
