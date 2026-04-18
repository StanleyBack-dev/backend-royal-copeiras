import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateLeadsResponseDto } from "./create-leads-response.dto";

export const CreateLeadsMutationResponseDto = createDataResponseDto(
  CreateLeadsResponseDto,
  "CreateLeadsMutationResponseDto",
);
