import { Resolver, Query, Args } from "@nestjs/graphql";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { GetPaymentsService } from "../../services/get/get-payments.service";
import { GetPaymentResponseDto } from "../../dtos/get/get-payment-response.dto";
import { GetPaymentsInputDto } from "../../dtos/get/get-payments-input.dto";
import { GetPaymentsListResponseDto } from "../../dtos/get/get-payments-list-response.dto";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver()
export class GetPaymentsResolver {
  constructor(private readonly getPaymentsService: GetPaymentsService) {}

  @Query(() => GetPaymentsListResponseDto, { name: "getPayments" })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPayments(
    @CurrentUser() user: AuthenticatedUser,
    @Args("input", { nullable: true }) input?: GetPaymentsInputDto,
  ) {
    const result = await this.getPaymentsService.findAll(user.idUsers, input);
    return buildPaginatedListResponse(
      result,
      RESPONSE_MESSAGES.payments.listed,
    );
  }

  @Query(() => GetPaymentResponseDto)
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Args("idPayments") idPayments: string,
  ): Promise<GetPaymentResponseDto> {
    const userId = user.idUsers;
    return this.getPaymentsService.getById(
      userId,
      idPayments,
    ) as Promise<GetPaymentResponseDto>;
  }

  @Query(() => [GetPaymentResponseDto])
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPaymentsByBudget(
    @CurrentUser() user: AuthenticatedUser,
    @Args("idBudgets") idBudgets: string,
  ): Promise<GetPaymentResponseDto[]> {
    const userId = user.idUsers;
    return this.getPaymentsService.getByBudget(userId, idBudgets) as Promise<
      GetPaymentResponseDto[]
    >;
  }

  @Query(() => [GetPaymentResponseDto])
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPaymentsByContract(
    @CurrentUser() user: AuthenticatedUser,
    @Args("idContracts") idContracts: string,
  ): Promise<GetPaymentResponseDto[]> {
    const userId = user.idUsers;
    return this.getPaymentsService.getByContract(
      userId,
      idContracts,
    ) as Promise<GetPaymentResponseDto[]>;
  }

  @Query(() => [GetPaymentResponseDto])
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPaymentsByLead(
    @CurrentUser() user: AuthenticatedUser,
    @Args("idLeads") idLeads: string,
  ): Promise<GetPaymentResponseDto[]> {
    const userId = user.idUsers;
    return this.getPaymentsService.getByLead(userId, idLeads) as Promise<
      GetPaymentResponseDto[]
    >;
  }

  @Query(() => [GetPaymentResponseDto])
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async getPaymentsByEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Args("idEvents") idEvents: string,
  ): Promise<GetPaymentResponseDto[]> {
    const userId = user.idUsers;
    return this.getPaymentsService.getByEvent(userId, idEvents) as Promise<
      GetPaymentResponseDto[]
    >;
  }
}
