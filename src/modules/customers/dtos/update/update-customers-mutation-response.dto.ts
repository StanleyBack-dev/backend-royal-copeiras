import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateCustomersResponseDto } from "./update-customers-response.dto";

export const UpdateCustomersMutationResponseDto = createDataResponseDto(
  UpdateCustomersResponseDto,
  "UpdateCustomersMutationResponseDto",
);
