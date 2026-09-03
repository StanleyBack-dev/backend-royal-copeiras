import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaymentsEntity } from "../../entities/payments.entity";
import { GetPaymentValidator } from "../../validators/get/get-payment.validator";

describe("GetPaymentValidator", () => {
  function makeRepo(
    single: PaymentsEntity | null,
    list: PaymentsEntity[] = [],
  ) {
    return {
      findOne: jest.fn().mockResolvedValue(single),
      find: jest.fn().mockResolvedValue(list),
    } as unknown as Repository<PaymentsEntity>;
  }

  it("should throw when idPayments is empty", async () => {
    const repo = makeRepo(null);

    await expect(
      GetPaymentValidator.validateAndGetById(repo, ""),
    ).rejects.toThrow(APP_ERRORS.payments.idRequired.message as string);
  });

  it("should throw when payment is not found by id", async () => {
    const repo = makeRepo(null);

    await expect(
      GetPaymentValidator.validateAndGetById(repo, "payment-1"),
    ).rejects.toThrow(APP_ERRORS.payments.notFound.message as string);
  });

  it("should return payment by id", async () => {
    const payment = { idPayments: "payment-1" } as PaymentsEntity;
    const repo = makeRepo(payment);

    const result = await GetPaymentValidator.validateAndGetById(
      repo,
      "payment-1",
    );

    expect(result.idPayments).toBe("payment-1");
  });

  it("should throw when idBudgets is empty", async () => {
    const repo = makeRepo(null, []);

    await expect(
      GetPaymentValidator.validateAndGetByBudget(repo, ""),
    ).rejects.toThrow(APP_ERRORS.payments.idRequired.message as string);
  });

  it("should return an empty list when no payments exist for the budget", async () => {
    const repo = makeRepo(null, []);

    const result = await GetPaymentValidator.validateAndGetByBudget(
      repo,
      "budget-1",
    );

    expect(result).toEqual([]);
  });

  it("should return payments by lead", async () => {
    const repo = makeRepo(null, [
      { idPayments: "payment-1" } as PaymentsEntity,
      { idPayments: "payment-2" } as PaymentsEntity,
    ]);

    const result = await GetPaymentValidator.validateAndGetByLead(
      repo,
      "lead-1",
    );

    expect(result).toHaveLength(2);
  });
});
