import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetPublicIntakeCodesResponseDto } from "./get-public-intake-codes-response.dto";

export const GetPublicIntakeCodesListResponseDto = createListResponseDto(
  GetPublicIntakeCodesResponseDto,
  "GetPublicIntakeCodesListResponseDto",
);
