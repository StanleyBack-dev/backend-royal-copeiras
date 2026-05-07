import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractStatus } from "../../enums/contract-status.enum";
import { UpdateContractsInputDto } from "../../dtos/update/update-contracts-input.dto";
import { parseContractDateOnly } from "../../utils/contract-date.util";

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

    const hasNonStatusUpdates = [
      input.effectiveDate,
      input.expiresAt,
      input.body,
      input.templateVersion,
      input.notes,
      input.sentVia,
      input.sentAt,
    ].some((value) => value !== undefined);

    if (
      hasNonStatusUpdates &&
      [
        ContractStatus.SIGNED,
        ContractStatus.CLOSED_WITHOUT_SIGNATURE,
        ContractStatus.CANCELED,
      ].includes(record.status)
    ) {
      throw AppException.from(APP_ERRORS.contracts.editForbidden, undefined);
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

    return contractsRepo.save(record);
  }
}
