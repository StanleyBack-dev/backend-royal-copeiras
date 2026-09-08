import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { VerifyPublicIntakeCodeResponseDto } from "./verify-public-intake-code-response.dto";

export const VerifyPublicIntakeCodeMutationResponseDto = createDataResponseDto(
  VerifyPublicIntakeCodeResponseDto,
  "VerifyPublicIntakeCodeMutationResponseDto",
);
