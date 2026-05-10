import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { CreatePaymentsService } from "../../services/create/create-payments.service";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { CreatePaymentResponseDto } from "../../dtos/create/create-payment-response.dto";

@Resolver()
export class CreatePaymentsResolver {
  constructor(private readonly createPaymentsService: CreatePaymentsService) {}

  @Mutation(() => CreatePaymentResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async createPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Args("input") input: CreatePaymentInputDto,
  ): Promise<CreatePaymentResponseDto> {
    const userId = user.idUsers;
    return this.createPaymentsService.execute(
      userId,
      input,
    ) as Promise<CreatePaymentResponseDto>;
  }
}
