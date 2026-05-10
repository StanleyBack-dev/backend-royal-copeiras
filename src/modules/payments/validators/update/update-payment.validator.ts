import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentItemEntity } from "../../entities/payment-item.entity";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { buildAggregateFromItems } from "../../utils/payment-aggregation.util";
import { parsePaymentDateOnly } from "../../utils/payment-date.util";

const ALLOWED_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [
    PaymentStatus.PARTIAL,
    PaymentStatus.PAID,
    PaymentStatus.CANCELED,
  ],
  [PaymentStatus.PARTIAL]: [PaymentStatus.PAID, PaymentStatus.CANCELED],
  [PaymentStatus.PAID]: [PaymentStatus.CANCELED],
  [PaymentStatus.CANCELED]: [],
};

export class UpdatePaymentValidator {
  static async validateAndUpdate(
    userId: string,
    input: UpdatePaymentInputDto,
    paymentsRepo: Repository<PaymentsEntity>,
  ): Promise<PaymentsEntity> {
    if (!input.idPayments) {
      throw AppException.from(APP_ERRORS.payments.idRequired, undefined);
    }

    const payment = await paymentsRepo.findOne({
      where: { idPayments: input.idPayments },
    });

    if (!payment) {
      throw AppException.from(APP_ERRORS.payments.notFound, undefined);
    }

    if (input.paymentItems && input.paymentItems.length > 0) {
      const normalizedItems = input.paymentItems
        .filter((item) => item.plannedAmount > 0)
        .map((item, index) => {
          if (!item.status) {
            throw AppException.from(
              APP_ERRORS.payments.statusRequired,
              undefined,
            );
          }

          if (item.paidAmount === undefined || item.paidAmount === null) {
            throw AppException.from(
              APP_ERRORS.payments.paidAmountRequired,
              undefined,
            );
          }

          if (
            [PaymentStatus.PENDING, PaymentStatus.CANCELED].includes(
              item.status,
            ) &&
            item.paidAmount > 0
          ) {
            throw AppException.from(
              APP_ERRORS.payments.invalidAmount,
              undefined,
            );
          }

          if (
            item.status === PaymentStatus.PARTIAL &&
            item.paidAmount >= item.plannedAmount
          ) {
            throw AppException.from(
              APP_ERRORS.payments.invalidAmount,
              undefined,
            );
          }

          if (!item.paymentDate) {
            throw AppException.from(
              APP_ERRORS.payments.paymentDateRequired,
              undefined,
            );
          }

          return {
            origin: item.origin,
            status: item.status,
            plannedAmount: Number(item.plannedAmount.toFixed(2)),
            paidAmount: Number(item.paidAmount.toFixed(2)),
            paymentDate: parsePaymentDateOnly(item.paymentDate),
            dueDate: item.dueDate
              ? parsePaymentDateOnly(item.dueDate)
              : undefined,
            proofUrl: item.proofUrl,
            notes: item.notes,
            sortOrder: item.sortOrder ?? index,
          };
        });

      if (normalizedItems.length === 0) {
        throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
      }

      return paymentsRepo.manager.transaction(async (manager) => {
        const paymentItemsRepo = manager.getRepository(PaymentItemEntity);
        await paymentItemsRepo.delete({ idPayments: payment.idPayments });

        const createdItems = normalizedItems.map((item) =>
          paymentItemsRepo.create({
            idPayments: payment.idPayments,
            payment,
            origin: item.origin,
            status: item.status,
            plannedAmount: item.plannedAmount,
            paidAmount: item.paidAmount,
            paymentDate: item.paymentDate,
            dueDate: item.dueDate,
            proofUrl: item.proofUrl,
            notes: item.notes,
            sortOrder: item.sortOrder,
          }),
        );

        await paymentItemsRepo.save(createdItems);

        const aggregate = buildAggregateFromItems(normalizedItems);
        payment.origin = aggregate.origin;
        payment.status = aggregate.status;
        payment.plannedAmount = aggregate.plannedAmount;
        payment.paidAmount = aggregate.paidAmount;
        payment.dueDate = aggregate.dueDate;
        payment.paymentDate = aggregate.paymentDate;

        if (input.notes !== undefined) {
          payment.notes = input.notes;
        }

        if (input.proofUrl !== undefined) {
          payment.proofUrl = input.proofUrl;
        }

        // Avoid relation synchronization side effects that can try to nullify
        // idtb_payments on child rows during parent save.
        delete payment.paymentItems;

        await manager.save(PaymentsEntity, payment);

        const updated = await manager.getRepository(PaymentsEntity).findOne({
          where: { idPayments: payment.idPayments },
          relations: { paymentItems: true },
        });

        return updated ?? payment;
      });
    }

    // Validate status transition
    if (input.status && input.status !== payment.status) {
      const allowedNextStatuses = ALLOWED_TRANSITIONS[payment.status] ?? [];
      if (!allowedNextStatuses.includes(input.status)) {
        throw AppException.from(
          APP_ERRORS.payments.invalidStatusTransition,
          undefined,
        );
      }
    }

    // Validate payment amount if provided
    if (input.paidAmount !== undefined) {
      if (input.paidAmount < 0) {
        throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
      }

      if (input.paidAmount > payment.plannedAmount) {
        throw AppException.from(
          APP_ERRORS.payments.paymentAmountExceedsPlanned,
          undefined,
        );
      }
    }

    // Validate required fields for status transitions
    const newStatus = input.status ?? payment.status;

    const effectivePaidAmount = input.paidAmount ?? payment.paidAmount ?? 0;

    if (
      [PaymentStatus.PENDING, PaymentStatus.CANCELED].includes(newStatus) &&
      effectivePaidAmount > 0
    ) {
      throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
    }

    if (newStatus === PaymentStatus.PAID) {
      if (!input.paymentDate) {
        throw AppException.from(
          APP_ERRORS.payments.paymentDateRequired,
          undefined,
        );
      }
      if (input.paidAmount === undefined || input.paidAmount === null) {
        throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
      }
    }

    if (newStatus === PaymentStatus.PARTIAL) {
      if (!input.paymentDate) {
        throw AppException.from(
          APP_ERRORS.payments.paymentDateRequired,
          undefined,
        );
      }
      if (
        input.paidAmount === undefined ||
        input.paidAmount === null ||
        input.paidAmount <= 0
      ) {
        throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
      }
      if (effectivePaidAmount >= payment.plannedAmount) {
        throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
      }
    }

    return paymentsRepo.manager.transaction(async (manager) => {
      payment.status = newStatus;

      if (input.paidAmount !== undefined) {
        payment.paidAmount = Number(input.paidAmount.toFixed(2));
      }

      if (input.paymentDate) {
        payment.paymentDate = parsePaymentDateOnly(input.paymentDate);
      }

      if (input.dueDate) {
        payment.dueDate = parsePaymentDateOnly(input.dueDate);
      }

      if (input.proofUrl !== undefined) {
        payment.proofUrl = input.proofUrl;
      }

      if (input.notes !== undefined) {
        payment.notes = input.notes;
      }

      return manager.save(PaymentsEntity, payment);
    });
  }
}
