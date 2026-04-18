import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetBudgetsResponseDto } from "./get-budgets-response.dto";

export const GetBudgetsListResponseDto = createListResponseDto(
  GetBudgetsResponseDto,
  "GetBudgetsListResponseDto",
);
