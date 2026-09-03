import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { UpdateCompanyProfileInputDto } from "../../dtos/update/update-company-profile-input.dto";
import { UpdateCompanyProfileMutationResponseDto } from "../../dtos/update/update-company-profile-mutation-response.dto";
import { UpdateCompanyProfileService } from "../../services/update/update-company-profile.service";

@Resolver(() => UpdateCompanyProfileMutationResponseDto)
export class UpdateCompanyProfileResolver {
  constructor(
    private readonly updateCompanyProfileService: UpdateCompanyProfileService,
  ) {}

  @Mutation(() => UpdateCompanyProfileMutationResponseDto, {
    name: "updateCompanyProfile",
  })
  @RequirePermissions(AuthPermission.MANAGE_COMPANY_PROFILE)
  async updateCompanyProfile(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateCompanyProfileInputDto,
  ) {
    const profile = await this.updateCompanyProfileService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(profile, RESPONSE_MESSAGES.companyProfile.updated);
  }
}
