import { Args, Query, Resolver } from "@nestjs/graphql";
import { GetLeadsService } from "../../services/get/get-leads.service";
import { GetLeadsInputDto } from "../../dtos/get/get-leads-input.dto";
import { GetLeadsListResponseDto } from "../../dtos/get/get-leads-list-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => GetLeadsListResponseDto)
export class GetLeadsResolver {
  constructor(private readonly getLeadsService: GetLeadsService) {}

  @Query(() => GetLeadsListResponseDto, { name: "getLeads" })
  @RequirePermissions(AuthPermission.READ_LEADS)
  async getLeads(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetLeadsInputDto,
  ) {
    const leads = await this.getLeadsService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(leads, RESPONSE_MESSAGES.leads.listed);
  }
}
