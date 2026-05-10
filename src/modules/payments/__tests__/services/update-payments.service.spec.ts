import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { UpdatePaymentsService } from "../../services/update/update-payments.service";
import { UpdatePaymentValidator } from "../../validators/update/update-payment.validator";

describe("UpdatePaymentsService", () => {
  const userId = "user-1";

  const input = {
    idPayments: "payment-1",
    status: PaymentStatus.PAID,
    paidAmount: 100,
    paymentDate: "2026-05-09",
  } as UpdatePaymentInputDto;

  const paymentEntity = {
    idPayments: "payment-1",
    idUsers: userId,
    origin: PaymentOrigin.BUDGET_ADVANCE,
    status: PaymentStatus.PAID,
    plannedAmount: 100,
    paidAmount: 100,
    paymentDate: new Date("2026-05-09T00:00:00.000Z"),
    createdAt: new Date("2026-05-09T00:00:00.000Z"),
    updatedAt: new Date("2026-05-09T00:00:00.000Z"),
  } as PaymentsEntity;

  function makeService() {
    const paymentsRepository = {} as Repository<PaymentsEntity>;
    const authorizationService = {
      assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthorizationService;

    const service = new UpdatePaymentsService(
      paymentsRepository,
      authorizationService,
    );

    return { service, paymentsRepository, authorizationService };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should authorize and update payment", async () => {
    const { service, paymentsRepository, authorizationService } = makeService();

    const validatorSpy = jest
      .spyOn(UpdatePaymentValidator, "validateAndUpdate")
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
    );
    expect(result.status).toBe(PaymentStatus.PAID);
  });
});
