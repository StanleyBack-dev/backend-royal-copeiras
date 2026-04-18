import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UpdateLeadsService } from "../../services/update/update-leads.service";
import { UpdateLeadsInputDto } from "../../dtos/update/update-leads-input.dto";
import { UpdateLeadsMutationResponseDto } from "../../dtos/update/update-leads-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateLeadsMutationResponseDto)
export class UpdateLeadsResolver {
  constructor(private readonly updateLeadsService: UpdateLeadsService) {}

  @Mutation(() => UpdateLeadsMutationResponseDto, {
    name: "updateLeads",
  })
  @RequirePermissions(AuthPermission.MANAGE_LEADS)
  async updateLeads(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateLeadsInputDto,
  ) {
    const lead = await this.updateLeadsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(lead, RESPONSE_MESSAGES.leads.updated);
  }
}
