import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { UpdateEventsInputDto } from "../../dtos/update/update-events-input.dto";
import { UpdateEventsMutationResponseDto } from "../../dtos/update/update-events-mutation-response.dto";
import { UpdateEventsService } from "../../services/update/update-events.service";

@Resolver(() => UpdateEventsMutationResponseDto)
export class UpdateEventsResolver {
  constructor(private readonly updateEventsService: UpdateEventsService) {}

  @Mutation(() => UpdateEventsMutationResponseDto, {
    name: "updateEvents",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updateEvents(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateEventsInputDto,
  ) {
    const event = await this.updateEventsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(event, RESPONSE_MESSAGES.events.updated);
  }
}
