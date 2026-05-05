import { ContractStatus } from "../enums/contract-status.enum";

export interface ContractPdfSnapshot {
  schemaVersion: string;
  generatedAt: string;
  contract: {
    idContracts: string;
    idUsers: string;
    idBudgets: string;
    idLeads?: string;
    budgetNumber: string;
    contractNumber: string;
    status: ContractStatus;
    issueDate: string;
    validUntil?: string;
    effectiveDate?: string;
    expiresAt?: string;
    body?: string;
    notes?: string;
  };
  budget?: {
    issueDate?: string;
    validUntil?: string;
    eventDates: string[];
    eventArrivalTimes: string[];
    eventDepartureTimes: string[];
    eventLocation?: string;
    durationHours?: number;
    paymentMethod?: string;
    advancePercentage?: number;
    displacementFee?: number;
    totalAmount?: number;
    items?: Array<{
      serviceType?: string;
      quantity?: number;
      description?: string;
    }>;
  };
  lead?: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
  };
}
