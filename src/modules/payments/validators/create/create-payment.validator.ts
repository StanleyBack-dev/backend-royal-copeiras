import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaymentsEntity } from "../../entities/payments.entity";
import { PaymentItemEntity } from "../../entities/payment-item.entity";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { buildAggregateFromItems } from "../../utils/payment-aggregation.util";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { parsePaymentDateOnly } from "../../utils/payment-date.util";

type NormalizedPaymentItem = {
  origin: PaymentOrigin;
  plannedAmount: number;
  status: PaymentStatus;
  paidAmount: number;
  paymentDate?: Date;
  dueDate?: Date;
  proofUrl?: string;
  notes?: string;
  sortOrder: number;
};

export class CreatePaymentValidator {
  private static normalizeItems(
    input: CreatePaymentInputDto,
  ): NormalizedPaymentItem[] {
    const fromItems = (input.paymentItems ?? [])
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
          throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
        }

        if (
          item.status === PaymentStatus.PARTIAL &&
          item.paidAmount >= item.plannedAmount
        ) {
          throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
        }

        return {
          origin: item.origin,
          plannedAmount: Number(item.plannedAmount.toFixed(2)),
          status: item.status,
          paidAmount: Number(item.paidAmount.toFixed(2)),
          paymentDate: undefined,
          dueDate: item.dueDate
            ? parsePaymentDateOnly(item.dueDate)
            : undefined,
          proofUrl: item.proofUrl,
          notes: item.notes,
          sortOrder: item.sortOrder ?? index,
        };
      });

    if (fromItems.length > 0) {
      return fromItems;
    }

    if (!input.origin || !input.plannedAmount || input.plannedAmount <= 0) {
      return [];
    }

    return [
      {
        origin: input.origin,
        plannedAmount: Number(input.plannedAmount.toFixed(2)),
        status: PaymentStatus.PENDING,
        paidAmount: 0,
        dueDate: input.dueDate
          ? parsePaymentDateOnly(input.dueDate)
          : undefined,
        notes: input.notes,
        sortOrder: 0,
      },
    ];
  }

  static async validateAndCreate(
    userId: string,
    input: CreatePaymentInputDto,
    paymentsRepo: Repository<PaymentsEntity>,
    leadsRepo: Repository<LeadsEntity>,
  ): Promise<PaymentsEntity> {
    if (!input.idLeads) {
      throw AppException.from(APP_ERRORS.payments.leadRequired, undefined);
    }

    const lead = await leadsRepo.findOne({
      where: { idLeads: input.idLeads },
    });

    if (!lead) {
      throw AppException.from(APP_ERRORS.payments.leadNotFound, undefined);
    }

    if (!input.idContracts && !input.idEvents) {
      throw AppException.from(APP_ERRORS.payments.referenceRequired, undefined);
    }

    const normalizedItems = this.normalizeItems(input);
    if (normalizedItems.length === 0) {
      throw AppException.from(APP_ERRORS.payments.invalidAmount, undefined);
    }

    const existing = await paymentsRepo.findOne(
      input.idContracts
        ? {
            where: { idContracts: input.idContracts },
            relations: { paymentItems: true },
          }
        : {
            where: { idEvents: input.idEvents },
            relations: { paymentItems: true },
          },
    );

    if (existing) {
      let shouldPersist = false;

      if (input.idEvents && existing.idEvents !== input.idEvents) {
        existing.idEvents = input.idEvents;
        shouldPersist = true;
      }

      if (input.idContracts && existing.idContracts !== input.idContracts) {
        existing.idContracts = input.idContracts;
        shouldPersist = true;
      }

      if (input.idBudgets && existing.idBudgets !== input.idBudgets) {
        existing.idBudgets = input.idBudgets;
        shouldPersist = true;
      }

      if (shouldPersist) {
        await paymentsRepo.save(existing);
      }

      return existing;
    }

    const aggregate = buildAggregateFromItems(normalizedItems);

    return paymentsRepo.manager.transaction(async (manager) => {
      const payment = manager.create(PaymentsEntity, {
        idUsers: userId,
        idLeads: input.idLeads,
        idBudgets: input.idBudgets,
        idContracts: input.idContracts,
        idEvents: input.idEvents,
        idEmployees: input.idEmployees,
        origin: aggregate.origin,
        status: aggregate.status,
        plannedAmount: aggregate.plannedAmount,
        paidAmount: aggregate.paidAmount,
        dueDate: aggregate.dueDate,
        paymentDate: aggregate.paymentDate,
        notes: input.notes,
      });

      const createdPayment = await manager.save(PaymentsEntity, payment);

      const paymentItemsRepo = manager.getRepository(PaymentItemEntity);
      const paymentItems = normalizedItems.map((item) =>
        paymentItemsRepo.create({
          idPayments: createdPayment.idPayments,
          payment: createdPayment,
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

      if (paymentItems.length > 0) {
        await paymentItemsRepo.save(paymentItems);
      }

      const saved = await manager.getRepository(PaymentsEntity).findOne({
        where: { idPayments: createdPayment.idPayments },
        relations: { paymentItems: true },
      });

      return saved ?? createdPayment;
    });
  }
}
