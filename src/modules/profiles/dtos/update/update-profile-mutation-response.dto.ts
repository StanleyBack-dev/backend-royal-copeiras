import { createDataResponseDto } from "../../../../common/responses/factories/create-data-response.dto";
import { UpdateProfileResponseDto } from "./update-profile-response.dto";

export const UpdateProfileMutationResponseDto = createDataResponseDto(
  UpdateProfileResponseDto,
  "UpdateProfileMutationResponseDto",
);
