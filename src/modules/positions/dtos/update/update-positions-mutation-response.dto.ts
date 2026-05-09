import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdatePositionsResponseDto } from "./update-positions-response.dto";

export const UpdatePositionsMutationResponseDto = createDataResponseDto(
  UpdatePositionsResponseDto,
  "UpdatePositionsMutationResponseDto",
);
