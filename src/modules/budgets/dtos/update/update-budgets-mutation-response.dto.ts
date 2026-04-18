import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateBudgetsResponseDto } from "./update-budgets-response.dto";

export const UpdateBudgetsMutationResponseDto = createDataResponseDto(
  UpdateBudgetsResponseDto,
  "UpdateBudgetsMutationResponseDto",
);
