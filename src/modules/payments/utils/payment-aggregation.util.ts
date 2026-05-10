import { PaymentOrigin } from "../enums/payment-origin.enum";
import { PaymentStatus } from "../enums/payment-status.enum";

type PaymentItemLike = {
  origin: PaymentOrigin;
  status?: PaymentStatus;
  plannedAmount: number;
  paidAmount?: number;
  paymentDate?: Date;
  dueDate?: Date;
};

export interface PaymentAggregateValues {
  origin: PaymentOrigin;
  status: PaymentStatus;
  plannedAmount: number;
  paidAmount: number;
  paymentDate?: Date;
  dueDate?: Date;
}

export function buildAggregateFromItems(
  items: PaymentItemLike[],
): PaymentAggregateValues {
  const safeItems = items.filter((item) => item.plannedAmount > 0);

  if (safeItems.length === 0) {
    return {
      origin: PaymentOrigin.CONTRACT,
      status: PaymentStatus.PENDING,
      plannedAmount: 0,
      paidAmount: 0,
    };
  }

  const plannedAmount = Number(
    safeItems.reduce((total, item) => total + item.plannedAmount, 0).toFixed(2),
  );
  const paidAmount = Number(
    safeItems
      .reduce((total, item) => total + (item.paidAmount ?? 0), 0)
      .toFixed(2),
  );

  let status = PaymentStatus.PENDING;
  if (plannedAmount > 0 && paidAmount >= plannedAmount) {
    status = PaymentStatus.PAID;
  } else if (paidAmount > 0) {
    status = PaymentStatus.PARTIAL;
  } else if (
    safeItems.every((item) => item.status === PaymentStatus.CANCELED)
  ) {
    status = PaymentStatus.CANCELED;
  }

  const dueDates = safeItems
    .map((item) => item.dueDate)
    .filter((value): value is Date => value instanceof Date);
  const paymentDates = safeItems
    .map((item) => item.paymentDate)
    .filter((value): value is Date => value instanceof Date);

  const dueDate = dueDates.length
    ? new Date(Math.min(...dueDates.map((date) => date.getTime())))
    : undefined;
  const paymentDate = paymentDates.length
    ? new Date(Math.max(...paymentDates.map((date) => date.getTime())))
    : undefined;

  return {
    origin: safeItems[0].origin,
    status,
    plannedAmount,
    paidAmount,
    dueDate,
    paymentDate,
  };
}
