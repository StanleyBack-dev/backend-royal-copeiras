import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateEmployeesResponseDto } from "./create-employees-response.dto";

export const CreateEmployeesMutationResponseDto = createDataResponseDto(
  CreateEmployeesResponseDto,
  "CreateEmployeesMutationResponseDto",
);