import { Args, Field, InputType, Mutation, Resolver } from "@nestjs/graphql";
import { IsUUID } from "class-validator";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { SuccessResponseDto } from "../../../../common/responses/dtos/success-response.dto";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildSuccessResponse } from "../../../../common/responses/helpers/response.helper";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { SendContractEmailService } from "../../services/pdf/send-contract-email.service";

@InputType()
export class SendContractEmailInputDto {
  @Field()
  @IsUUID()
  idContracts!: string;
}

@Resolver(() => SuccessResponseDto)
export class SendContractEmailResolver {
  constructor(
    private readonly sendContractEmailService: SendContractEmailService,
  ) {}

  @Mutation(() => SuccessResponseDto, {
    name: "sendContractEmail",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async sendContractEmail(
    @CurrentUser() user: unknown,
    @Args("input") input: SendContractEmailInputDto,
  ) {
    await this.sendContractEmailService.execute(
      (user as { idUsers: string }).idUsers,
      { idContracts: input.idContracts },
    );

    return buildSuccessResponse(RESPONSE_MESSAGES.contracts.emailSent);
  }
}
