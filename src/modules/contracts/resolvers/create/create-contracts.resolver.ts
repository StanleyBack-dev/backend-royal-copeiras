import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { CreateContractsInputDto } from "../../dtos/create/create-contracts-input.dto";
import { CreateContractsMutationResponseDto } from "../../dtos/create/create-contracts-mutation-response.dto";
import { CreateContractsService } from "../../services/create/create-contracts.service";

@Resolver(() => CreateContractsMutationResponseDto)
export class CreateContractsResolver {
  constructor(
    private readonly createContractsService: CreateContractsService,
  ) {}

  @Mutation(() => CreateContractsMutationResponseDto, {
    name: "createContracts",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async createContracts(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateContractsInputDto,
  ) {
    const contract = await this.createContractsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(contract, RESPONSE_MESSAGES.contracts.created);
  }
}
