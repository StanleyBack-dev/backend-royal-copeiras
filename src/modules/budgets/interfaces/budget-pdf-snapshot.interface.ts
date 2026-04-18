import { BudgetStatus } from "../enums/budget-status.enum";

export interface BudgetPdfSnapshotItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sortOrder: number;
}

export interface BudgetPdfSnapshot {
  schemaVersion: string;
  generatedAt: string;
  budget: {
    idBudgets: string;
    idUsers: string;
    idLeads?: string;
    budgetNumber: string;
    status: BudgetStatus;
    issueDate: string;
    validUntil: string;
    eventDates: string[];
    eventLocation?: string;
    guestCount?: number;
    durationHours?: number;
    paymentMethod?: string;
    advancePercentage?: number;
    notes?: string;
    subtotal: number;
    totalAmount: number;
  };
  items: BudgetPdfSnapshotItem[];
}
