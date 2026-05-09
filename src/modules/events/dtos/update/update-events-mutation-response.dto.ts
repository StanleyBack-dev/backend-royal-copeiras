import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateEventsResponseDto } from "./update-events-response.dto";

export const UpdateEventsMutationResponseDto = createDataResponseDto(
  UpdateEventsResponseDto,
  "UpdateEventsMutationResponseDto",
);
