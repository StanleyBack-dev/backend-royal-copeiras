import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { UpdateContractsInputDto } from "../../dtos/update/update-contracts-input.dto";
import {
  ContractPartySnapshot,
  sanitizeContractParty,
} from "../../interfaces/contract-party.interface";
import { parseContractDateOnly } from "../../utils/contract-date.util";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { BudgetStatus } from "../../../budgets/enums/budget-status.enum";

/**
 * Statuses in which the contract content (dates, body, template, notes and the
 * CONTRATADA snapshot) may still be edited. Mirrors the frontend rule
 * (`isNonDraftLocked`): once the contract leaves the draft it is frozen and the
 * only writes allowed are status transitions and send tracking.
 */
const CONTRACT_CONTENT_EDITABLE_STATUSES: ContractStatus[] = [
  ContractStatus.DRAFT,
];

/**
 * Statuses in which send tracking (`sentVia`/`sentAt`) may be recorded. Matches
 * the frontend, which only exposes the "send" actions on draft, generated and
 * pending-signature contracts.
 */
const CONTRACT_SEND_TRACKING_STATUSES: ContractStatus[] = [
  ContractStatus.DRAFT,
  ContractStatus.GENERATED,
  ContractStatus.PENDING_SIGNATURE,
];

const CONTRACT_ALLOWED_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  [ContractStatus.DRAFT]: [
    ContractStatus.GENERATED,
    ContractStatus.PENDING_SIGNATURE,
    ContractStatus.CANCELED,
    ContractStatus.EXPIRED,
  ],
  [ContractStatus.GENERATED]: [
    ContractStatus.PENDING_SIGNATURE,
    ContractStatus.SIGNED,
    ContractStatus.CLOSED_WITHOUT_SIGNATURE,
    ContractStatus.REJECTED,
    ContractStatus.CANCELED,
    ContractStatus.EXPIRED,
    ContractStatus.DRAFT,
  ],
  [ContractStatus.PENDING_SIGNATURE]: [
    ContractStatus.SIGNED,
    ContractStatus.CLOSED_WITHOUT_SIGNATURE,
    ContractStatus.REJECTED,
    ContractStatus.CANCELED,
    ContractStatus.EXPIRED,
    ContractStatus.GENERATED,
  ],
  [ContractStatus.SIGNED]: [ContractStatus.CANCELED],
  [ContractStatus.CLOSED_WITHOUT_SIGNATURE]: [ContractStatus.CANCELED],
  [ContractStatus.REJECTED]: [
    ContractStatus.GENERATED,
    ContractStatus.CANCELED,
  ],
  [ContractStatus.EXPIRED]: [ContractStatus.GENERATED, ContractStatus.CANCELED],
  [ContractStatus.CANCELED]: [],
};

export class UpdateContractsValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdateContractsInputDto,
    contractsRepo: Repository<ContractsEntity>,
  ): Promise<ContractsEntity> {
    if (!input.idContracts) {
      throw AppException.from(APP_ERRORS.contracts.idRequired, undefined);
    }

    const record = await contractsRepo.findOne({
      where: { idContracts: input.idContracts },
    });

    if (!record) {
      throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
    }

    const hasUpdateData = Object.entries(input).some(
      ([key, value]) => key !== "idContracts" && value !== undefined,
    );

    if (!hasUpdateData) {
      throw AppException.from(APP_ERRORS.contracts.noUpdateData, undefined);
    }

    if (input.status && input.status !== record.status) {
      const allowedNextStatuses =
        CONTRACT_ALLOWED_TRANSITIONS[record.status] ?? [];
      if (!allowedNextStatuses.includes(input.status)) {
        throw AppException.from(
          APP_ERRORS.contracts.invalidStatusTransition,
          undefined,
        );
      }
    }

    const hasContentUpdates = [
      input.effectiveDate,
      input.expiresAt,
      input.body,
      input.templateVersion,
      input.notes,
      input.contractor,
    ].some((value) => value !== undefined);

    if (
      hasContentUpdates &&
      !CONTRACT_CONTENT_EDITABLE_STATUSES.includes(record.status)
    ) {
      throw AppException.from(APP_ERRORS.contracts.editForbidden, undefined);
    }

    const hasSendTrackingUpdates =
      input.sentVia !== undefined || input.sentAt !== undefined;

    if (
      hasSendTrackingUpdates &&
      !CONTRACT_SEND_TRACKING_STATUSES.includes(record.status)
    ) {
      throw AppException.from(
        APP_ERRORS.contracts.sendTrackingForbidden,
        undefined,
      );
    }

    if (
      input.status === ContractStatus.CANCELED &&
      input.status !== record.status
    ) {
      return contractsRepo.manager.transaction(async (manager) => {
        const contractsRepoTx = manager.getRepository(ContractsEntity);
        const budgetsRepoTx = manager.getRepository(BudgetsEntity);

        const rec = await contractsRepoTx.findOne({
          where: { idContracts: input.idContracts },
        });

        if (!rec) {
          throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
        }

        rec.status = input.status ?? rec.status;
        rec.effectiveDate = input.effectiveDate
          ? parseContractDateOnly(input.effectiveDate)
          : rec.effectiveDate;
        rec.expiresAt = input.expiresAt
          ? parseContractDateOnly(input.expiresAt)
          : rec.expiresAt;
        rec.body = input.body ?? rec.body;
        rec.templateVersion = input.templateVersion ?? rec.templateVersion;
        rec.sentVia = input.sentVia ?? rec.sentVia;
        rec.sentAt = input.sentAt ? new Date(input.sentAt) : rec.sentAt;
        rec.notes = input.notes ?? rec.notes;

        const saved = await contractsRepoTx.save(rec);

        if (rec.idBudgets) {
          const budget = await budgetsRepoTx.findOne({
            where: { idBudgets: rec.idBudgets },
          });
          if (budget) {
            budget.status = BudgetStatus.CANCELED;
            await budgetsRepoTx.save(budget);
          }
        }

        return saved;
      });
    }

    record.status = input.status ?? record.status;
    record.effectiveDate = input.effectiveDate
      ? parseContractDateOnly(input.effectiveDate)
      : record.effectiveDate;
    record.expiresAt = input.expiresAt
      ? parseContractDateOnly(input.expiresAt)
      : record.expiresAt;
    record.body = input.body ?? record.body;
    record.templateVersion = input.templateVersion ?? record.templateVersion;
    record.sentVia = input.sentVia ?? record.sentVia;
    record.sentAt = input.sentAt ? new Date(input.sentAt) : record.sentAt;
    record.notes = input.notes ?? record.notes;

    if (input.contractor !== undefined) {
      record.contractSnapshot = this.applyContractorOverride(
        record.contractSnapshot,
        input.contractor,
      );
    }

    return contractsRepo.save(record);
  }

  private static applyContractorOverride(
    snapshot: Record<string, unknown> | null | undefined,
    override: Partial<Record<keyof ContractPartySnapshot, unknown>>,
  ): Record<string, unknown> {
    const currentSnapshot = snapshot ?? {};
    const currentContractor = sanitizeContractParty(
      currentSnapshot.contractor as ContractPartySnapshot | undefined,
    );

    return {
      ...currentSnapshot,
      contractor: {
        ...currentContractor,
        ...sanitizeContractParty(override),
      },
    };
  }
}
