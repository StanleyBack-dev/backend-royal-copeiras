import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateContractsResponseDto } from "./update-contracts-response.dto";

export const UpdateContractsMutationResponseDto = createDataResponseDto(
  UpdateContractsResponseDto,
  "UpdateContractsMutationResponseDto",
);
