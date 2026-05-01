import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { GetEventsInputDto } from "../../dtos/get/get-events-input.dto";
import { GetEventsListResponseDto } from "../../dtos/get/get-events-list-response.dto";
import { GetEventsService } from "../../services/get/get-events.service";

@Resolver(() => GetEventsListResponseDto)
export class GetEventsResolver {
  constructor(private readonly getEventsService: GetEventsService) {}

  @Query(() => GetEventsListResponseDto, { name: "getEvents" })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getEvents(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetEventsInputDto,
  ) {
    const result = await this.getEventsService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(result, RESPONSE_MESSAGES.events.listed);
  }
}
