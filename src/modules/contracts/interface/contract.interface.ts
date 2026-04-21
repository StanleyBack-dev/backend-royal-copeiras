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
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
