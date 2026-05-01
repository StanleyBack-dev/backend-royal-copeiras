import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { UpdateEventAssignmentInputDto } from "../../dtos/update/update-event-assignment-input.dto";
import { UpdateEventAssignmentMutationResponseDto } from "../../dtos/update/update-event-assignment-mutation-response.dto";
import { UpdateEventAssignmentService } from "../../services/update/update-event-assignment.service";

@Resolver(() => UpdateEventAssignmentMutationResponseDto)
export class UpdateEventAssignmentResolver {
  constructor(
    private readonly updateEventAssignmentService: UpdateEventAssignmentService,
  ) {}

  @Mutation(() => UpdateEventAssignmentMutationResponseDto, {
    name: "updateEventAssignment",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updateEventAssignment(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateEventAssignmentInputDto,
  ) {
    const assignment = await this.updateEventAssignmentService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      assignment,
      RESPONSE_MESSAGES.events.assignmentUpdated,
    );
  }
}
