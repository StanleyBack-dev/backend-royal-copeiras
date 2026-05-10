import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { CreatePaymentValidator } from "../../validators/create/create-payment.validator";

describe("CreatePaymentValidator", () => {
  const userId = "user-1";

  function makeInput(overrides: Partial<CreatePaymentInputDto> = {}) {
    return {
      idLeads: "lead-1",
      idBudgets: "budget-1",
      origin: PaymentOrigin.BUDGET_ADVANCE,
      plannedAmount: 150,
      ...overrides,
    } as CreatePaymentInputDto;
  }

  function makeRepos() {
    const managerImpl = {
      create: jest.fn((_: unknown, value: object) => value),
      save: jest.fn(async (_: unknown, value: object) => ({
        idPayments: "payment-1",
        status: PaymentStatus.PENDING,
        ...value,
      })),
    };

    const paymentsRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      manager: {
        transaction: jest.fn(async (run) => run(managerImpl)),
      },
    } as unknown as Repository<PaymentsEntity>;

    const leadsRepo = {
      findOne: jest
        .fn()
        .mockResolvedValue({ idLeads: "lead-1" } as LeadsEntity),
    } as unknown as Repository<LeadsEntity>;

    return { paymentsRepo, leadsRepo, managerImpl };
  }

  it("should throw when lead is not provided", async () => {
    const { paymentsRepo, leadsRepo } = makeRepos();

    await expect(
      CreatePaymentValidator.validateAndCreate(
        userId,
        makeInput({ idLeads: undefined as unknown as string }),
        paymentsRepo,
        leadsRepo,
      ),
    ).rejects.toThrow(APP_ERRORS.payments.leadRequired.message as string);
  });

  it("should throw when lead is not found", async () => {
    const { paymentsRepo, leadsRepo } = makeRepos();
    (leadsRepo.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      CreatePaymentValidator.validateAndCreate(
        userId,
        makeInput(),
        paymentsRepo,
        leadsRepo,
      ),
    ).rejects.toThrow(APP_ERRORS.payments.leadNotFound.message as string);
  });

  it("should throw when amount is invalid", async () => {
    const { paymentsRepo, leadsRepo } = makeRepos();

    await expect(
      CreatePaymentValidator.validateAndCreate(
        userId,
        makeInput({ plannedAmount: 0 }),
        paymentsRepo,
        leadsRepo,
      ),
    ).rejects.toThrow(APP_ERRORS.payments.invalidAmount.message as string);
  });

  it("should return existing payment when duplicate is found", async () => {
    const { paymentsRepo, leadsRepo } = makeRepos();
    const existing = { idPayments: "payment-dup" } as PaymentsEntity;
    (paymentsRepo.findOne as jest.Mock).mockResolvedValue(existing);

    const result = await CreatePaymentValidator.validateAndCreate(
      userId,
      makeInput(),
      paymentsRepo,
      leadsRepo,
    );

    expect(result).toBe(existing);
  });

  it("should create payment successfully", async () => {
    const { paymentsRepo, leadsRepo, managerImpl } = makeRepos();

    const result = await CreatePaymentValidator.validateAndCreate(
      userId,
      makeInput(),
      paymentsRepo,
      leadsRepo,
    );

    expect(result.idPayments).toBe("payment-1");
    expect(managerImpl.create).toHaveBeenCalled();
    expect(managerImpl.save).toHaveBeenCalled();
  });
});
