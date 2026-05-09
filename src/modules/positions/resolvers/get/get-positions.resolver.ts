import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetPositionsInputDto } from "../../dtos/get/get-positions-input.dto";
import { GetPositionsListResponseDto } from "../../dtos/get/get-positions-list-response.dto";
import { GetPositionsService } from "../../services/get/get-positions.service";

@Resolver(() => GetPositionsListResponseDto)
export class GetPositionsResolver {
  constructor(private readonly getPositionsService: GetPositionsService) {}

  @Query(() => GetPositionsListResponseDto, {
    name: "getPositions",
  })
  @RequirePermissions(AuthPermission.READ_EMPLOYEES)
  async getPositions(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetPositionsInputDto,
  ) {
    const result = await this.getPositionsService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      result,
      RESPONSE_MESSAGES.positions.listed,
    );
  }
}
