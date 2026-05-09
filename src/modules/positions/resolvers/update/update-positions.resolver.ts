import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { UpdatePositionsInputDto } from "../../dtos/update/update-positions-input.dto";
import { UpdatePositionsMutationResponseDto } from "../../dtos/update/update-positions-mutation-response.dto";
import { UpdatePositionsService } from "../../services/update/update-positions.service";

@Resolver(() => UpdatePositionsMutationResponseDto)
export class UpdatePositionsResolver {
  constructor(
    private readonly updatePositionsService: UpdatePositionsService,
  ) {}

  @Mutation(() => UpdatePositionsMutationResponseDto, {
    name: "updatePositions",
  })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async updatePositions(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdatePositionsInputDto,
  ) {
    const updated = await this.updatePositionsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(updated, RESPONSE_MESSAGES.positions.updated);
  }
}
