import { BudgetStatus } from "../enums/budget-status.enum";
import { BudgetItemType } from "../enums/budget-item-type.enum";

export interface BudgetPdfSnapshotItem {
  itemType: BudgetItemType;
  description: string;
  unit?: string | null;
  supplyName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sortOrder: number;
  eventDateIndex: number;
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
    eventArrivalTimes: string[];
    eventDepartureTimes: string[];
    eventLocation: string[];
    guestCount: number[];
    durationHours: number[];
    paymentMethod?: string;
    advancePercentage?: number;
    discountType: string[];
    discountPercentage: number[];
    discountAmount: number[];
    notes?: string;
    displacementFee: number[];
    subtotal: number;
    totalAmount: number;
  };
  items: BudgetPdfSnapshotItem[];
}
