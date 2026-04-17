import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetCustomersResponseDto } from "./get-customers-response.dto";

export const GetCustomersListResponseDto = createListResponseDto(
  GetCustomersResponseDto,
  "GetCustomersListResponseDto",
);
