import { createListResponseDto } from "../../../common/responses/factories/create-list-response.dto";
import { GetSignaturesResponseDto } from "./get-signatures-response.dto";

export const GetSignaturesListResponseDto = createListResponseDto(
  GetSignaturesResponseDto,
  "GetSignaturesListResponseDto",
);
