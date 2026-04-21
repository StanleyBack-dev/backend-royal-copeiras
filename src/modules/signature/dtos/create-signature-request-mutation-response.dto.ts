import { createDataResponseDto } from "../../../common/responses/factories/create-data-response.dto";
import { SignatureRequestResponseDto } from "./signature-request-response.dto";

export const CreateSignatureRequestMutationResponseDto = createDataResponseDto(
  SignatureRequestResponseDto,
  "CreateSignatureRequestMutationResponseDto",
);
