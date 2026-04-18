import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { FreezeBudgetPdfResponseDto } from "./freeze-budget-pdf-response.dto";

export const FreezeBudgetPdfMutationResponseDto = createDataResponseDto(
  FreezeBudgetPdfResponseDto,
  "FreezeBudgetPdfMutationResponseDto",
);
