import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateBudgetsResponseDto } from "./create-budgets-response.dto";

export const CreateBudgetsMutationResponseDto = createDataResponseDto(
  CreateBudgetsResponseDto,
  "CreateBudgetsMutationResponseDto",
);
