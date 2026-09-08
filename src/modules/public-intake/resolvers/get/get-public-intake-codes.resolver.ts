import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetPublicIntakeCodesInputDto } from "../../dtos/get/get-public-intake-codes-input.dto";
import { GetPublicIntakeCodesListResponseDto } from "../../dtos/get/get-public-intake-codes-list-response.dto";
import { GetPublicIntakeCodesService } from "../../services/get/get-public-intake-codes.service";

@Resolver(() => GetPublicIntakeCodesListResponseDto)
export class GetPublicIntakeCodesResolver {
  constructor(
    private readonly getPublicIntakeCodesService: GetPublicIntakeCodesService,
  ) {}

  @Query(() => GetPublicIntakeCodesListResponseDto, {
    name: "getPublicIntakeCodes",
  })
  @RequirePermissions(AuthPermission.MANAGE_LEADS)
  async getPublicIntakeCodes(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetPublicIntakeCodesInputDto,
  ) {
    const codes = await this.getPublicIntakeCodesService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      codes,
      RESPONSE_MESSAGES.publicIntake.listed,
    );
  }
}
