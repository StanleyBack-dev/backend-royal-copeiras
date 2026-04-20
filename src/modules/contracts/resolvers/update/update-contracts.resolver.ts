import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { UpdateContractsInputDto } from "../../dtos/update/update-contracts-input.dto";
import { UpdateContractsMutationResponseDto } from "../../dtos/update/update-contracts-mutation-response.dto";
import { UpdateContractsService } from "../../services/update/update-contracts.service";

@Resolver(() => UpdateContractsMutationResponseDto)
export class UpdateContractsResolver {
  constructor(
    private readonly updateContractsService: UpdateContractsService,
  ) {}

  @Mutation(() => UpdateContractsMutationResponseDto, {
    name: "updateContracts",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updateContracts(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateContractsInputDto,
  ) {
    const contract = await this.updateContractsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(contract, RESPONSE_MESSAGES.contracts.updated);
  }
}
