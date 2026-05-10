import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
import { PaymentsEntity } from "../../entities/payments.entity";
import { GetPaymentResponseDto } from "../../dtos/get/get-payment-response.dto";
import { GetPaymentsInputDto } from "../../dtos/get/get-payments-input.dto";
import { IPayment } from "../../interfaces/payment.interface";
import { GetPaymentValidator } from "../../validators/get/get-payment.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { PaymentStatus } from "../../enums/payment-status.enum";

@Injectable()
export class GetPaymentsService {
  constructor(
    @InjectRepository(PaymentsEntity)
    private readonly paymentsRepository: Repository<PaymentsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetPaymentsInputDto,
  ): Promise<PaginatedResult<GetPaymentResponseDto>> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const page = input?.page ?? 1;
    const limit = input?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (input?.idPayments) where.idPayments = input.idPayments;
    if (input?.idLeads) where.idLeads = input.idLeads;
    if (input?.idBudgets) where.idBudgets = input.idBudgets;
    if (input?.idContracts) where.idContracts = input.idContracts;
    if (input?.idEvents) where.idEvents = input.idEvents;
    if (
      input?.status &&
      Object.values(PaymentStatus).includes(input.status as PaymentStatus)
    ) {
      where.status = input.status;
    }

    if (input?.startDate && input?.endDate) {
      where.createdAt = Between(
        new Date(input.startDate),
        new Date(input.endDate),
      );
    } else if (input?.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(input.startDate));
    } else if (input?.endDate) {
      where.createdAt = LessThanOrEqual(new Date(input.endDate));
    }

    const [items, total] = await this.paymentsRepository.findAndCount({
      where,
      relations: { paymentItems: true },
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((item) => GetPaymentResponseDto.fromEntity(item)),
      total,
      currentPage: page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }

  async getById(userId: string, idPayments: string): Promise<IPayment> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const payment = await GetPaymentValidator.validateAndGetById(
      this.paymentsRepository,
      idPayments,
    );

    return GetPaymentResponseDto.fromEntity(payment);
  }

  async getByBudget(userId: string, idBudgets: string): Promise<IPayment[]> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const payments = await GetPaymentValidator.validateAndGetByBudget(
      this.paymentsRepository,
      idBudgets,
    );

    return payments.map((payment) => GetPaymentResponseDto.fromEntity(payment));
  }

  async getByContract(
    userId: string,
    idContracts: string,
  ): Promise<IPayment[]> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const payments = await GetPaymentValidator.validateAndGetByContract(
      this.paymentsRepository,
      idContracts,
    );

    return payments.map((payment) => GetPaymentResponseDto.fromEntity(payment));
  }

  async getByLead(userId: string, idLeads: string): Promise<IPayment[]> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const payments = await GetPaymentValidator.validateAndGetByLead(
      this.paymentsRepository,
      idLeads,
    );

    return payments.map((payment) => GetPaymentResponseDto.fromEntity(payment));
  }

  async getByEvent(userId: string, idEvents: string): Promise<IPayment[]> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const payments = await GetPaymentValidator.validateAndGetByEvent(
      this.paymentsRepository,
      idEvents,
    );

    return payments.map((payment) => GetPaymentResponseDto.fromEntity(payment));
  }
}
