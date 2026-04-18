import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { GenerateBudgetPreviewResponseDto } from "./generate-budget-preview-response.dto";

export const GenerateBudgetPreviewMutationResponseDto = createDataResponseDto(
  GenerateBudgetPreviewResponseDto,
  "GenerateBudgetPreviewMutationResponseDto",
);
