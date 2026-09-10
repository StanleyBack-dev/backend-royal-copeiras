import { ContractStatus } from "../enums/contract-status.enum";
import { ContractPartySnapshot } from "./contract-party.interface";

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
    eventLocation?: string[];
    guestCount?: number[];
    durationHours?: number[];
    paymentMethod?: string;
    advancePercentage?: number;
    displacementFee?: number[];
    totalAmount?: number;
    items?: Array<{
      itemType?: string;
      serviceType?: string;
      quantity?: number;
      description?: string;
      unit?: string | null;
      supplyName?: string | null;
      eventDateIndex?: number;
    }>;
  };
  lead?: {
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
    legalName?: string;
    address?: string;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressZipCode?: string;
  };
  contractor: ContractPartySnapshot;
}
