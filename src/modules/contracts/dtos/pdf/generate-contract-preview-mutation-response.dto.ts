import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { GenerateContractPreviewResponseDto } from "./generate-contract-preview-response.dto";

export const GenerateContractPreviewMutationResponseDto = createDataResponseDto(
  GenerateContractPreviewResponseDto,
  "GenerateContractPreviewMutationResponseDto",
);
