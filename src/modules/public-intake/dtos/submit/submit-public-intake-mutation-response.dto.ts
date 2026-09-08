import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { SubmitPublicIntakeResponseDto } from "./submit-public-intake-response.dto";

export const SubmitPublicIntakeMutationResponseDto = createDataResponseDto(
  SubmitPublicIntakeResponseDto,
  "SubmitPublicIntakeMutationResponseDto",
);
