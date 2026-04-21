import { createDataResponseDto } from "../../../common/responses/factories/create-data-response.dto";
import { SignatureRequestResponseDto } from "./signature-request-response.dto";

export const GetSignatureStatusMutationResponseDto = createDataResponseDto(
  SignatureRequestResponseDto,
  "GetSignatureStatusMutationResponseDto",
);
