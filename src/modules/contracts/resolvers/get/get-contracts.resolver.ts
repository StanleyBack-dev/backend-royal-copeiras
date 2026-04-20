import { Args, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { GetContractsInputDto } from "../../dtos/get/get-contracts-input.dto";
import { GetContractsListResponseDto } from "../../dtos/get/get-contracts-list-response.dto";
import { GetContractsService } from "../../services/get/get-contracts.service";

@Resolver(() => GetContractsListResponseDto)
export class GetContractsResolver {
  constructor(private readonly getContractsService: GetContractsService) {}

  @Query(() => GetContractsListResponseDto, { name: "getContracts" })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getContracts(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetContractsInputDto,
  ) {
    const contracts = await this.getContractsService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      contracts,
      RESPONSE_MESSAGES.contracts.listed,
    );
  }
}
