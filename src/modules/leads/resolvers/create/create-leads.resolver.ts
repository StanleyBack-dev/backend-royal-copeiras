import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { CreateLeadsService } from "../../services/create/create-leads.service";
import { CreateLeadsInputDto } from "../../dtos/create/create-leads-input.dto";
import { CreateLeadsMutationResponseDto } from "../../dtos/create/create-leads-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => CreateLeadsMutationResponseDto)
export class CreateLeadsResolver {
  constructor(private readonly createLeadsService: CreateLeadsService) {}

  @Mutation(() => CreateLeadsMutationResponseDto, {
    name: "createLeads",
  })
  @RequirePermissions(AuthPermission.MANAGE_LEADS)
  async createLeads(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateLeadsInputDto,
  ) {
    const lead = await this.createLeadsService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(lead, RESPONSE_MESSAGES.leads.created);
  }
}
