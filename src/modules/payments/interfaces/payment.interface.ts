import { PaymentStatus } from "../enums/payment-status.enum";
import { PaymentOrigin } from "../enums/payment-origin.enum";
import type { IPaymentItem } from "./payment-item.interface";

export interface IPayment {
  idPayments: string;
  idUsers: string;
  idLeads?: string;
  idBudgets?: string;
  idContracts?: string;
  idEvents?: string;
  idEmployees?: string;
  origin: PaymentOrigin;
  status: PaymentStatus;
  plannedAmount: number;
  paidAmount?: number;
  paymentDate?: string | Date;
  dueDate?: string | Date;
  proofUrl?: string;
  notes?: string;
  paymentItems?: IPaymentItem[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
