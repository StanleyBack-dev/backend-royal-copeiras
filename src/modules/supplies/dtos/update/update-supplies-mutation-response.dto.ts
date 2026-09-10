import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateSuppliesResponseDto } from "./update-supplies-response.dto";

export const UpdateSuppliesMutationResponseDto = createDataResponseDto(
  UpdateSuppliesResponseDto,
  "UpdateSuppliesMutationResponseDto",
);
