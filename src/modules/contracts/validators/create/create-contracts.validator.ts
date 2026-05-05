import { EntityManager, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { BudgetStatus } from "../../../budgets/enums/budget-status.enum";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { CreateContractsInputDto } from "../../dtos/create/create-contracts-input.dto";
import {
  formatContractDateOnly,
  parseContractDateOnly,
} from "../../utils/contract-date.util";

function resolveValidUntilFromEventDates(
  eventDates: string[],
): Date | undefined {
  const parsedDates = eventDates
    .map((eventDate) => parseContractDateOnly(eventDate))
    .filter((eventDate) => !Number.isNaN(eventDate.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  return parsedDates.at(-1);
}

function resolveRetentionUntil(issueDate: Date): Date {
  return new Date(
    Date.UTC(
      issueDate.getUTCFullYear() + 10,
      issueDate.getUTCMonth(),
      issueDate.getUTCDate(),
      12,
      0,
      0,
    ),
  );
}

export class CreateContractsValidator {
  static async validateAndCreate(
    userId: string,
    input: CreateContractsInputDto,
    contractsRepo: Repository<ContractsEntity>,
    budgetsRepo: Repository<BudgetsEntity>,
  ): Promise<ContractsEntity> {
    if (!input.idBudgets) {
      throw AppException.from(APP_ERRORS.contracts.budgetRequired, undefined);
    }

    const budget = await budgetsRepo.findOne({
      where: { idBudgets: input.idBudgets },
      relations: { lead: true },
    });

    if (!budget) {
      throw AppException.from(APP_ERRORS.contracts.budgetNotFound, undefined);
    }

    if (budget.status !== BudgetStatus.APPROVED) {
      throw AppException.from(
        APP_ERRORS.contracts.budgetNotApproved,
        undefined,
      );
    }

    const existing = await contractsRepo.findOne({
      where: { idBudgets: budget.idBudgets },
    });

    if (existing) {
      throw AppException.from(
        APP_ERRORS.contracts.alreadyExistsForBudget,
        undefined,
      );
    }

    const issueDate = parseContractDateOnly(input.issueDate);
    const validUntil = resolveValidUntilFromEventDates(budget.eventDates || []);
    const retentionUntil = resolveRetentionUntil(issueDate);

    const allowedInitialStatus = new Set<ContractStatus>([
      ContractStatus.DRAFT,
      ContractStatus.GENERATED,
      ContractStatus.PENDING_SIGNATURE,
    ]);
    const initialStatus = input.status ?? ContractStatus.GENERATED;
    if (!allowedInitialStatus.has(initialStatus)) {
      throw AppException.from(
        APP_ERRORS.contracts.invalidInitialStatus,
        undefined,
      );
    }

    return contractsRepo.manager.transaction(async (manager) => {
      const contractNumber = await this.generateContractNumber(manager);

      const contract = manager.create(ContractsEntity, {
        idUsers: userId,
        idBudgets: budget.idBudgets,
        idLeads: budget.idLeads,
        budgetNumber: budget.budgetNumber,
        contractNumber,
        status: initialStatus,
        issueDate,
        validUntil,
        body: input.body,
        templateVersion: input.templateVersion ?? 1,
        retentionUntil,
        notes: input.notes,
        contractSnapshot: {
          budget: {
            idBudgets: budget.idBudgets,
            budgetNumber: budget.budgetNumber,
            status: budget.status,
            issueDate: formatContractDateOnly(budget.issueDate),
            validUntil: formatContractDateOnly(budget.validUntil),
            eventDates: budget.eventDates,
            eventArrivalTimes: budget.eventArrivalTimes,
            eventDepartureTimes: budget.eventDepartureTimes,
            eventLocation: budget.eventLocation,
            durationHours: budget.durationHours,
            totalAmount: budget.totalAmount,
            paymentMethod: budget.paymentMethod,
            advancePercentage: budget.advancePercentage,
          },
          lead: budget.lead
            ? {
                idLeads: budget.lead.idLeads,
                name: budget.lead.name,
                email: budget.lead.email,
                phone: budget.lead.phone,
                document: budget.lead.document,
              }
            : undefined,
        },
      });

      return manager.save(ContractsEntity, contract);
    });
  }

  private static async generateContractNumber(
    manager: EntityManager,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CTR-${year}`;

    const totalForYear = await manager
      .createQueryBuilder(ContractsEntity, "contract")
      .where("contract.contractNumber LIKE :prefix", {
        prefix: `${prefix}-%`,
      })
      .getCount();

    const sequence = String(totalForYear + 1).padStart(5, "0");
    return `${prefix}-${sequence}`;
  }
}
