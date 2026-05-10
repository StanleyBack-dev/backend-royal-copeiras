import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { UpdatePaymentsService } from "../../services/update/update-payments.service";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { UpdatePaymentResponseDto } from "../../dtos/update/update-payment-response.dto";

@Resolver()
export class UpdatePaymentsResolver {
  constructor(private readonly updatePaymentsService: UpdatePaymentsService) {}

  @Mutation(() => UpdatePaymentResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async updatePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Args("input") input: UpdatePaymentInputDto,
  ): Promise<UpdatePaymentResponseDto> {
    const userId = user.idUsers;
    return this.updatePaymentsService.execute(
      userId,
      input,
    ) as Promise<UpdatePaymentResponseDto>;
  }
}
