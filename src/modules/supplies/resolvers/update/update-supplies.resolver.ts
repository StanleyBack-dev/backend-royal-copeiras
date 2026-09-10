import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { UpdateSuppliesInputDto } from "../../dtos/update/update-supplies-input.dto";
import { UpdateSuppliesMutationResponseDto } from "../../dtos/update/update-supplies-mutation-response.dto";
import { UpdateSuppliesService } from "../../services/update/update-supplies.service";

@Resolver(() => UpdateSuppliesMutationResponseDto)
export class UpdateSuppliesResolver {
  constructor(private readonly updateSuppliesService: UpdateSuppliesService) {}

  @Mutation(() => UpdateSuppliesMutationResponseDto, {
    name: "updateSupplies",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updateSupplies(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateSuppliesInputDto,
  ) {
    const updated = await this.updateSuppliesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(updated, RESPONSE_MESSAGES.supplies.updated);
  }
}
