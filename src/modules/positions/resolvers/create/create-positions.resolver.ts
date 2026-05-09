import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CreatePositionsInputDto } from "../../dtos/create/create-positions-input.dto";
import { CreatePositionsMutationResponseDto } from "../../dtos/create/create-positions-mutation-response.dto";
import { CreatePositionsService } from "../../services/create/create-positions.service";

@Resolver(() => CreatePositionsMutationResponseDto)
export class CreatePositionsResolver {
  constructor(
    private readonly createPositionsService: CreatePositionsService,
  ) {}

  @Mutation(() => CreatePositionsMutationResponseDto, {
    name: "createPositions",
  })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async createPositions(
    @CurrentUser() user: unknown,
    @Args("input") input: CreatePositionsInputDto,
  ) {
    const position = await this.createPositionsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(position, RESPONSE_MESSAGES.positions.created);
  }
}
