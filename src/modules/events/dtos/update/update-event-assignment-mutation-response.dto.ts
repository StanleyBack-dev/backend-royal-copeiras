import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateEventAssignmentResponseDto } from "./update-event-assignment-response.dto";

export const UpdateEventAssignmentMutationResponseDto = createDataResponseDto(
  UpdateEventAssignmentResponseDto,
  "UpdateEventAssignmentMutationResponseDto",
);
