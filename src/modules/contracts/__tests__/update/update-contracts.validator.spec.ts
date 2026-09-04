import { Repository } from "typeorm";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { UpdateContractsInputDto } from "../../dtos/update/update-contracts-input.dto";
import { UpdateContractsValidator } from "../../validators/update/update-contracts.validator";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";

const userId = "user-1";

function makeContract(
  overrides: Partial<ContractsEntity> = {},
): ContractsEntity {
  return {
    idContracts: "contract-1",
    idUsers: userId,
    idBudgets: "budget-1",
    status: ContractStatus.DRAFT,
    issueDate: new Date("2026-01-10"),
    templateVersion: 1,
    body: "corpo original",
    notes: "notas originais",
    contractSnapshot: {
      contractor: { legalName: "Royal Copeiras LTDA" },
    },
    ...overrides,
  } as ContractsEntity;
}

function makeRepo(current: ContractsEntity | null) {
  const budgetsRepoTx = {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(async (value: unknown) => value),
  };

  const repo: {
    findOne: jest.Mock;
    save: jest.Mock;
    manager: {
      transaction: jest.Mock;
      getRepository: jest.Mock;
    };
  } = {
    findOne: jest.fn().mockResolvedValue(current),
    save: jest.fn(async (value: unknown) => value),
    manager: {
      transaction: jest.fn(async (run: (m: unknown) => Promise<unknown>) =>
        run({
          getRepository: (entity: unknown) =>
            entity === BudgetsEntity ? budgetsRepoTx : repo,
        }),
      ),
      getRepository: jest.fn(),
    },
  };

  return {
    repo: repo as unknown as Repository<ContractsEntity>,
    budgetsRepoTx,
  };
}

function makeInput(
  overrides: Partial<UpdateContractsInputDto> = {},
): UpdateContractsInputDto {
  const input = new UpdateContractsInputDto();
  input.idContracts = "contract-1";
  Object.assign(input, overrides);
  return input;
}

describe("UpdateContractsValidator", () => {
  it("allows editing contract content while in draft", async () => {
    const { repo } = makeRepo(makeContract({ status: ContractStatus.DRAFT }));

    const result = await UpdateContractsValidator.validateAndUpdate(
      userId,
      makeInput({ body: "corpo novo", notes: "notas novas" }),
      repo,
    );

    expect(result.body).toBe("corpo novo");
    expect(result.notes).toBe("notas novas");
    expect(repo.save).toHaveBeenCalled();
  });

  it.each([
    ContractStatus.GENERATED,
    ContractStatus.PENDING_SIGNATURE,
    ContractStatus.SIGNED,
    ContractStatus.REJECTED,
    ContractStatus.EXPIRED,
    ContractStatus.CANCELED,
  ])("blocks content edits when contract is %s", async (status) => {
    const { repo } = makeRepo(makeContract({ status }));

    await expect(
      UpdateContractsValidator.validateAndUpdate(
        userId,
        makeInput({ body: "corpo novo" }),
        repo,
      ),
    ).rejects.toThrow(APP_ERRORS.contracts.editForbidden.message as string);
  });

  it("blocks the contractor snapshot override outside draft", async () => {
    const { repo } = makeRepo(
      makeContract({ status: ContractStatus.PENDING_SIGNATURE }),
    );

    await expect(
      UpdateContractsValidator.validateAndUpdate(
        userId,
        makeInput({ contractor: { legalName: "Outra Empresa" } }),
        repo,
      ),
    ).rejects.toThrow(APP_ERRORS.contracts.editForbidden.message as string);
  });

  it("allows send tracking on a generated contract", async () => {
    const { repo } = makeRepo(
      makeContract({ status: ContractStatus.GENERATED }),
    );

    const sentAt = "2026-02-01T12:00:00.000Z";
    const result = await UpdateContractsValidator.validateAndUpdate(
      userId,
      makeInput({ sentVia: "email_preview", sentAt }),
      repo,
    );

    expect(result.sentVia).toBe("email_preview");
    expect(result.sentAt).toEqual(new Date(sentAt));
  });

  it("blocks send tracking on a signed contract", async () => {
    const { repo } = makeRepo(makeContract({ status: ContractStatus.SIGNED }));

    await expect(
      UpdateContractsValidator.validateAndUpdate(
        userId,
        makeInput({ sentVia: "whatsapp" }),
        repo,
      ),
    ).rejects.toThrow(
      APP_ERRORS.contracts.sendTrackingForbidden.message as string,
    );
  });

  it("allows a status-only transition out of draft", async () => {
    const { repo } = makeRepo(makeContract({ status: ContractStatus.DRAFT }));

    const result = await UpdateContractsValidator.validateAndUpdate(
      userId,
      makeInput({ status: ContractStatus.GENERATED }),
      repo,
    );

    expect(result.status).toBe(ContractStatus.GENERATED);
  });

  it("rejects an invalid status transition", async () => {
    const { repo } = makeRepo(makeContract({ status: ContractStatus.DRAFT }));

    await expect(
      UpdateContractsValidator.validateAndUpdate(
        userId,
        makeInput({ status: ContractStatus.SIGNED }),
        repo,
      ),
    ).rejects.toThrow(
      APP_ERRORS.contracts.invalidStatusTransition.message as string,
    );
  });

  it("allows reverting a pending-signature contract back to draft", async () => {
    const { repo } = makeRepo(
      makeContract({ status: ContractStatus.PENDING_SIGNATURE }),
    );

    const result = await UpdateContractsValidator.validateAndUpdate(
      userId,
      makeInput({ status: ContractStatus.DRAFT }),
      repo,
    );

    expect(result.status).toBe(ContractStatus.DRAFT);
  });

  it("cancels a pending-signature contract and cascades to the budget", async () => {
    const contract = makeContract({
      status: ContractStatus.PENDING_SIGNATURE,
    });
    const { repo, budgetsRepoTx } = makeRepo(contract);
    budgetsRepoTx.findOne.mockResolvedValue({
      idBudgets: "budget-1",
    } as BudgetsEntity);

    const result = await UpdateContractsValidator.validateAndUpdate(
      userId,
      makeInput({ status: ContractStatus.CANCELED }),
      repo,
    );

    expect(result.status).toBe(ContractStatus.CANCELED);
    expect(budgetsRepoTx.save).toHaveBeenCalled();
  });
});
