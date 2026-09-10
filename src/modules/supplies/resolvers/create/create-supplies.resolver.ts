import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CreateSuppliesInputDto } from "../../dtos/create/create-supplies-input.dto";
import { CreateSuppliesMutationResponseDto } from "../../dtos/create/create-supplies-mutation-response.dto";
import { CreateSuppliesService } from "../../services/create/create-supplies.service";

@Resolver(() => CreateSuppliesMutationResponseDto)
export class CreateSuppliesResolver {
  constructor(private readonly createSuppliesService: CreateSuppliesService) {}

  @Mutation(() => CreateSuppliesMutationResponseDto, {
    name: "createSupplies",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async createSupplies(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateSuppliesInputDto,
  ) {
    const supply = await this.createSuppliesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(supply, RESPONSE_MESSAGES.supplies.created);
  }
}
