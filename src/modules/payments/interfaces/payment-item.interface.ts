import { PaymentOrigin } from "../enums/payment-origin.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

export interface IPaymentItem {
  idPaymentItems: string;
  idPayments: string;
  origin: PaymentOrigin;
  status: PaymentStatus;
  plannedAmount: number;
  paidAmount?: number;
  paymentDate?: string | Date;
  dueDate?: string | Date;
  proofUrl?: string;
  notes?: string;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
