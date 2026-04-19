import { BudgetStatus } from "../enums/budget-status.enum";
import { IBudgetItem } from "./budget-item.interface";

export interface IBudget {
  idBudgets: string;
  idLeads?: string;
  budgetNumber: string;
  status: BudgetStatus;
  issueDate: Date | string;
  validUntil: Date | string;
  eventDates: string[];
  eventLocation?: string;
  guestCount?: number;
  durationHours?: number;
  paymentMethod?: string;
  advancePercentage?: number;
  notes?: string;
  subtotal: number;
  totalAmount: number;
  pdfUrl?: string;
  pdfHash?: string;
  pdfFrozenAt?: Date | string;
  items?: IBudgetItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
