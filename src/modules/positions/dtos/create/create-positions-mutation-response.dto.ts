import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreatePositionsResponseDto } from "./create-positions-response.dto";

export const CreatePositionsMutationResponseDto = createDataResponseDto(
  CreatePositionsResponseDto,
  "CreatePositionsMutationResponseDto",
);
