import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateLeadsResponseDto } from "./update-leads-response.dto";

export const UpdateLeadsMutationResponseDto = createDataResponseDto(
  UpdateLeadsResponseDto,
  "UpdateLeadsMutationResponseDto",
);
