import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetSuppliesResponseDto } from "./get-supplies-response.dto";

export const GetSuppliesListResponseDto = createListResponseDto(
  GetSuppliesResponseDto,
  "GetSuppliesListResponseDto",
);
