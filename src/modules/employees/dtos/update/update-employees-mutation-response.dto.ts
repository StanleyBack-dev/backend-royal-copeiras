import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateEmployeesResponseDto } from "./update-employees-response.dto";

export const UpdateEmployeesMutationResponseDto = createDataResponseDto(
  UpdateEmployeesResponseDto,
  "UpdateEmployeesMutationResponseDto",
);
