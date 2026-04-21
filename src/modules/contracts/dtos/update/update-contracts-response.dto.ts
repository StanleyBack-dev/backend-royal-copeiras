import { Field, ObjectType, Int } from "@nestjs/graphql";
import { ContractStatus } from "../../enums/contract-status.enum";
import { IContract } from "../../interface/contract.interface";
import { formatContractDateOnly } from "../../utils/contract-date.util";

@ObjectType()
export class UpdateContractsResponseDto implements IContract {
  static fromEntity(
    entity: import("../../entities/contracts.entity").ContractsEntity,
  ): UpdateContractsResponseDto {
    const dto = new UpdateContractsResponseDto();
    dto.idContracts = entity.idContracts;
    dto.idBudgets = entity.idBudgets;
    dto.idLeads = entity.idLeads;
    dto.budgetNumber = entity.budgetNumber;
    dto.contractNumber = entity.contractNumber;
    dto.status = entity.status;
    dto.issueDate = formatContractDateOnly(entity.issueDate);
    dto.validUntil = entity.validUntil
      ? formatContractDateOnly(entity.validUntil)
      : undefined;
    dto.effectiveDate = entity.effectiveDate
      ? formatContractDateOnly(entity.effectiveDate)
      : undefined;
    dto.expiresAt = entity.expiresAt
      ? formatContractDateOnly(entity.expiresAt)
      : undefined;
    dto.body = entity.body;
    dto.templateVersion = entity.templateVersion;
    dto.retentionUntil = entity.retentionUntil
      ? formatContractDateOnly(entity.retentionUntil)
      : undefined;
    dto.sentVia = entity.sentVia;
    dto.sentAt = entity.sentAt ? entity.sentAt.toISOString() : undefined;
    dto.notes = entity.notes;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }

  @Field()
  idContracts!: string;

  @Field()
  idBudgets!: string;

  @Field({ nullable: true })
  idLeads?: string;

  @Field()
  budgetNumber!: string;

  @Field()
  contractNumber!: string;

  @Field(() => ContractStatus)
  status!: ContractStatus;

  @Field()
  issueDate!: string;

  @Field({ nullable: true })
  validUntil?: string;

  @Field({ nullable: true })
  effectiveDate?: string;

  @Field({ nullable: true })
  expiresAt?: string;

  @Field({ nullable: true })
  body?: string;

  @Field(() => Int)
  templateVersion!: number;

  @Field({ nullable: true })
  retentionUntil?: string;

  @Field({ nullable: true })
  signatureProvider?: string;

  @Field({ nullable: true })
  signatureEnvelopeId?: string;

  @Field({ nullable: true })
  signatureStatus?: string;

  @Field({ nullable: true })
  signedByName?: string;

  @Field({ nullable: true })
  signedByDocument?: string;

  @Field({ nullable: true })
  signedByEmail?: string;

  @Field({ nullable: true })
  signerIp?: string;

  @Field({ nullable: true })
  signerUserAgent?: string;

  @Field({ nullable: true })
  signedAt?: string;

  @Field({ nullable: true })
  consentAt?: string;

  @Field({ nullable: true })
  sentVia?: string;

  @Field({ nullable: true })
  sentAt?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
