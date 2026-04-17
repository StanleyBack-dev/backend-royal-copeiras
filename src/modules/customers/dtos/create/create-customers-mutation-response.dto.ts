import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateCustomersResponseDto } from "./create-customers-response.dto";

export const CreateCustomersMutationResponseDto = createDataResponseDto(
  CreateCustomersResponseDto,
  "CreateCustomersMutationResponseDto",
);
