import { ContractStatus } from "../enums/contract-status.enum";

export interface IContract {
  idContracts: string;
  idBudgets: string;
  idLeads?: string;
  budgetNumber: string;
  contractNumber: string;
  status: ContractStatus;
  issueDate: Date | string;
  validUntil?: Date | string;
  effectiveDate?: Date | string;
  expiresAt?: Date | string;
  body?: string;
  templateVersion: number;
  retentionUntil?: Date | string;
  signatureProvider?: string;
  signatureEnvelopeId?: string;
  signatureStatus?: string;
  signedByName?: string;
  signedByDocument?: string;
  signedByEmail?: string;
  signerIp?: string;
  signerUserAgent?: string;
  signedAt?: Date | string;
  consentAt?: Date | string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
