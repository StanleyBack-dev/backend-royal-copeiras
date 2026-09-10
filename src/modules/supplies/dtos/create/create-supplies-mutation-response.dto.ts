import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateSuppliesResponseDto } from "./create-supplies-response.dto";

export const CreateSuppliesMutationResponseDto = createDataResponseDto(
  CreateSuppliesResponseDto,
  "CreateSuppliesMutationResponseDto",
);
