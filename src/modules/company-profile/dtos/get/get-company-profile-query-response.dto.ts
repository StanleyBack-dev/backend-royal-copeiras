import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { GetCompanyProfileResponseDto } from "./get-company-profile-response.dto";

export const GetCompanyProfileQueryResponseDto = createDataResponseDto(
  GetCompanyProfileResponseDto,
  "GetCompanyProfileQueryResponseDto",
);
