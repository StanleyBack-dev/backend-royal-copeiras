import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { GetPaymentsService } from "../../services/get/get-payments.service";
import { GetPaymentValidator } from "../../validators/get/get-payment.validator";

describe("GetPaymentsService", () => {
  const userId = "user-1";

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
    const authorizationService = {
      assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthorizationService;

    const service = new GetPaymentsService(
      paymentsRepository,
      authorizationService,
    );

    return { service, paymentsRepository, authorizationService };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should get payment by id with authorization", async () => {
    const { service, paymentsRepository, authorizationService } = makeService();

    const validatorSpy = jest
      .spyOn(GetPaymentValidator, "validateAndGetById")
      .mockResolvedValue(paymentEntity);

    const result = await service.getById(userId, "payment-1");

    expect(authorizationService.assertPermissionForUserId).toHaveBeenCalledWith(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );
    expect(validatorSpy).toHaveBeenCalledWith(paymentsRepository, "payment-1");
    expect(result.idPayments).toBe("payment-1");
  });

  it("should get payments by budget", async () => {
    const { service } = makeService();

    jest
      .spyOn(GetPaymentValidator, "validateAndGetByBudget")
      .mockResolvedValue([paymentEntity]);

    const result = await service.getByBudget(userId, "budget-1");

    expect(result).toHaveLength(1);
    expect(result[0].idPayments).toBe("payment-1");
  });

  it("should get payments by contract", async () => {
    const { service } = makeService();

    jest
      .spyOn(GetPaymentValidator, "validateAndGetByContract")
      .mockResolvedValue([paymentEntity]);

    const result = await service.getByContract(userId, "contract-1");

    expect(result).toHaveLength(1);
  });

  it("should get payments by lead", async () => {
    const { service } = makeService();

    jest
      .spyOn(GetPaymentValidator, "validateAndGetByLead")
      .mockResolvedValue([paymentEntity]);

    const result = await service.getByLead(userId, "lead-1");

    expect(result).toHaveLength(1);
  });
});
