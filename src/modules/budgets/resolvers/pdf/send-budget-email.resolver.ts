import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Field, InputType } from "@nestjs/graphql";
import { IsUUID } from "class-validator";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildSuccessResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { SuccessResponseDto } from "../../../../common/responses/dtos/success-response.dto";
import { SendBudgetEmailService } from "../../services/pdf/send-budget-email.service";

@InputType()
export class SendBudgetEmailInputDto {
  @Field()
  @IsUUID()
  idBudgets!: string;
}

@Resolver(() => SuccessResponseDto)
export class SendBudgetEmailResolver {
  constructor(
    private readonly sendBudgetEmailService: SendBudgetEmailService,
  ) {}

  @Mutation(() => SuccessResponseDto, {
    name: "sendBudgetEmail",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async sendBudgetEmail(
    @CurrentUser() user: unknown,
    @Args("input") input: SendBudgetEmailInputDto,
  ) {
    await this.sendBudgetEmailService.execute(
      (user as { idUsers: string }).idUsers,
      { idBudgets: input.idBudgets },
    );

    return buildSuccessResponse(RESPONSE_MESSAGES.budgets.emailSent);
  }
}
