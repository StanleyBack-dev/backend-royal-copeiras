import { Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetCompanyProfileQueryResponseDto } from "../../dtos/get/get-company-profile-query-response.dto";
import { GetCompanyProfileService } from "../../services/get/get-company-profile.service";

@Resolver(() => GetCompanyProfileQueryResponseDto)
export class GetCompanyProfileResolver {
  constructor(
    private readonly getCompanyProfileService: GetCompanyProfileService,
  ) {}

  @Query(() => GetCompanyProfileQueryResponseDto, { name: "getCompanyProfile" })
  @RequirePermissions(AuthPermission.READ_COMPANY_PROFILE)
  async getCompanyProfile(@CurrentUser() user: unknown) {
    const profile = await this.getCompanyProfileService.execute(
      (user as { idUsers: string }).idUsers,
    );

    return buildDataResponse(profile, RESPONSE_MESSAGES.companyProfile.fetched);
  }
}
