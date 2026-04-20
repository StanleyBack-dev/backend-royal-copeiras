import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { CreateContractsResponseDto } from "./create-contracts-response.dto";

export const CreateContractsMutationResponseDto = createDataResponseDto(
  CreateContractsResponseDto,
  "CreateContractsMutationResponseDto",
);
