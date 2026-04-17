import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetEmployeesResponseDto } from "./get-employees-response.dto";

export const GetEmployeesListResponseDto = createListResponseDto(
  GetEmployeesResponseDto,
  "GetEmployeesListResponseDto",
);
