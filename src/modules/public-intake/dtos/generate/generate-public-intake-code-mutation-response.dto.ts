import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { GeneratePublicIntakeCodeResponseDto } from "./generate-public-intake-code-response.dto";

export const GeneratePublicIntakeCodeMutationResponseDto =
  createDataResponseDto(
    GeneratePublicIntakeCodeResponseDto,
    "GeneratePublicIntakeCodeMutationResponseDto",
  );
