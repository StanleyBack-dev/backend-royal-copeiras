import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateCompanyProfileResponseDto } from "./update-company-profile-response.dto";

export const UpdateCompanyProfileMutationResponseDto = createDataResponseDto(
  UpdateCompanyProfileResponseDto,
  "UpdateCompanyProfileMutationResponseDto",
);
