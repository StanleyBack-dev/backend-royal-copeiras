import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { CreatePaymentsService } from "../../services/create/create-payments.service";
import { CreatePaymentValidator } from "../../validators/create/create-payment.validator";

describe("CreatePaymentsService", () => {
  const userId = "user-1";

  const input: CreatePaymentInputDto = {
    idLeads: "lead-1",
    idBudgets: "budget-1",
    origin: PaymentOrigin.BUDGET_ADVANCE,
    plannedAmount: 100,
  };

  const paymentEntity = {
    idPayments: "payment-1",
    idUsers: userId,
    idLeads: "lead-1",
    idBudgets: "budget-1",
    origin: PaymentOrigin.BUDGET_ADVANCE,
    status: PaymentStatus.PENDING,
    plannedAmount: 100,
    createdAt: new Date("2026-05-09T00:00:00.000Z"),
    updatedAt: new Date("2026-05-09T00:00:00.000Z"),
  } as PaymentsEntity;

  function makeService() {
    const paymentsRepository = {} as Repository<PaymentsEntity>;
    const leadsRepository = {} as Repository<LeadsEntity>;
    const authorizationService = {
      assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthorizationService;

    const service = new CreatePaymentsService(
      paymentsRepository,
      leadsRepository,
      authorizationService,
    );

    return {
      service,
      paymentsRepository,
      leadsRepository,
      authorizationService,
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should authorize and create payment", async () => {
    const {
      service,
      paymentsRepository,
      leadsRepository,
      authorizationService,
    } = makeService();

    const validatorSpy = jest
      .spyOn(CreatePaymentValidator, "validateAndCreate")
      .mockResolvedValue(paymentEntity);

    const result = await service.execute(userId, input);

    expect(authorizationService.assertPermissionForUserId).toHaveBeenCalledWith(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );
    expect(validatorSpy).toHaveBeenCalledWith(
      userId,
      input,
      paymentsRepository,
      leadsRepository,
    );
    expect(result.idPayments).toBe("payment-1");
  });

  it("should execute internal create without authorization", async () => {
    const {
      service,
      paymentsRepository,
      leadsRepository,
      authorizationService,
    } = makeService();

    const validatorSpy = jest
      .spyOn(CreatePaymentValidator, "validateAndCreate")
      .mockResolvedValue(paymentEntity);

    const result = await service.executeInternal(userId, input);

    expect(
      authorizationService.assertPermissionForUserId,
    ).not.toHaveBeenCalled();
    expect(validatorSpy).toHaveBeenCalledWith(
      userId,
      input,
      paymentsRepository,
      leadsRepository,
    );
    expect(result.idPayments).toBe("payment-1");
  });
});
