import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { UpdatePaymentValidator } from "../../validators/update/update-payment.validator";

describe("UpdatePaymentValidator", () => {
  const userId = "user-1";

  function makePayment(
    overrides: Partial<PaymentsEntity> = {},
  ): PaymentsEntity {
    return {
      idPayments: "payment-1",
      status: PaymentStatus.PENDING,
      plannedAmount: 1000,
      paidAmount: 0,
      ...overrides,
    } as PaymentsEntity;
  }

  function makeRepo(current: PaymentsEntity | null) {
    const managerImpl = {
      save: jest.fn(async (_: unknown, value: unknown) => value),
    };

    const paymentsRepo = {
      findOne: jest.fn().mockResolvedValue(current),
      manager: {
        transaction: jest.fn(async (run) => run(managerImpl)),
      },
    } as unknown as Repository<PaymentsEntity>;

    return { paymentsRepo, managerImpl };
  }

  it("should throw when idPayments is missing", async () => {
    const { paymentsRepo } = makeRepo(makePayment());

    await expect(
      UpdatePaymentValidator.validateAndUpdate(
        userId,
        {} as UpdatePaymentInputDto,
        paymentsRepo,
      ),
    ).rejects.toThrow(APP_ERRORS.payments.idRequired.message as string);
  });

  it("should throw when payment is not found", async () => {
    const { paymentsRepo } = makeRepo(null);

    await expect(
      UpdatePaymentValidator.validateAndUpdate(
        userId,
        { idPayments: "missing" } as UpdatePaymentInputDto,
        paymentsRepo,
      ),
    ).rejects.toThrow(APP_ERRORS.payments.notFound.message as string);
  });

  it("should throw for invalid status transition", async () => {
    const { paymentsRepo } = makeRepo(
      makePayment({ status: PaymentStatus.CANCELED }),
    );

    await expect(
      UpdatePaymentValidator.validateAndUpdate(
        userId,
        {
          idPayments: "payment-1",
          status: PaymentStatus.PAID,
          paidAmount: 1000,
          paymentDate: "2026-05-09",
        } as UpdatePaymentInputDto,
        paymentsRepo,
      ),
    ).rejects.toThrow(
      APP_ERRORS.payments.invalidStatusTransition.message as string,
    );
  });

  it("should throw when paid amount exceeds planned", async () => {
    const { paymentsRepo } = makeRepo(makePayment());

    await expect(
      UpdatePaymentValidator.validateAndUpdate(
        userId,
        {
          idPayments: "payment-1",
          paidAmount: 1200,
        } as UpdatePaymentInputDto,
        paymentsRepo,
      ),
    ).rejects.toThrow(
      APP_ERRORS.payments.paymentAmountExceedsPlanned.message as string,
    );
  });

  it("should throw when PAID does not include payment date", async () => {
    const { paymentsRepo } = makeRepo(makePayment());

    await expect(
      UpdatePaymentValidator.validateAndUpdate(
        userId,
        {
          idPayments: "payment-1",
          status: PaymentStatus.PAID,
          paidAmount: 1000,
        } as UpdatePaymentInputDto,
        paymentsRepo,
      ),
    ).rejects.toThrow(
      APP_ERRORS.payments.paymentDateRequired.message as string,
    );
  });

  it("should update payment successfully", async () => {
    const { paymentsRepo, managerImpl } = makeRepo(makePayment());

    const result = await UpdatePaymentValidator.validateAndUpdate(
      userId,
      {
        idPayments: "payment-1",
        status: PaymentStatus.PAID,
        paidAmount: 1000,
        paymentDate: "2026-05-09",
      } as UpdatePaymentInputDto,
      paymentsRepo,
    );

    expect(result.status).toBe(PaymentStatus.PAID);
    expect(result.paidAmount).toBe(1000);
    expect(managerImpl.save).toHaveBeenCalled();
  });
});
