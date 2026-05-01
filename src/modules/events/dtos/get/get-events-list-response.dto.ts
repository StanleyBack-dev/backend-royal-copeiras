import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetEventsResponseDto } from "./get-events-response.dto";

export const GetEventsListResponseDto = createListResponseDto(
  GetEventsResponseDto,
  "GetEventsListResponseDto",
);
