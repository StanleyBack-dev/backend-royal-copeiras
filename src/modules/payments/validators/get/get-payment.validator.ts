import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PaymentsEntity } from "../../entities/payments.entity";

export class GetPaymentValidator {
  static async validateAndGetById(
    paymentsRepo: Repository<PaymentsEntity>,
    idPayments: string,
  ): Promise<PaymentsEntity> {
    if (!idPayments) {
      throw AppException.from(APP_ERRORS.payments.idRequired, undefined);
    }

    const payment = await paymentsRepo.findOne({
      where: { idPayments },
      relations: { paymentItems: true },
    });

    if (!payment) {
      throw AppException.from(APP_ERRORS.payments.notFound, undefined);
    }

    return payment;
  }

  static async validateAndGetByBudget(
    paymentsRepo: Repository<PaymentsEntity>,
    idBudgets: string,
  ): Promise<PaymentsEntity[]> {
    if (!idBudgets) {
      throw AppException.from(APP_ERRORS.payments.idRequired, undefined);
    }

    const payments = await paymentsRepo.find({
      where: { idBudgets },
      relations: { paymentItems: true },
      order: { createdAt: "DESC" },
    });

    return payments;
  }

  static async validateAndGetByContract(
    paymentsRepo: Repository<PaymentsEntity>,
    idContracts: string,
  ): Promise<PaymentsEntity[]> {
    if (!idContracts) {
      throw AppException.from(APP_ERRORS.payments.idRequired, undefined);
    }

    const payments = await paymentsRepo.find({
      where: { idContracts },
      relations: { paymentItems: true },
      order: { createdAt: "DESC" },
    });

    return payments;
  }

  static async validateAndGetByLead(
    paymentsRepo: Repository<PaymentsEntity>,
    idLeads: string,
  ): Promise<PaymentsEntity[]> {
    if (!idLeads) {
      throw AppException.from(APP_ERRORS.payments.leadRequired, undefined);
    }

    const payments = await paymentsRepo.find({
      where: { idLeads },
      relations: { paymentItems: true },
      order: { createdAt: "DESC" },
    });

    return payments;
  }

  static async validateAndGetByEvent(
    paymentsRepo: Repository<PaymentsEntity>,
    idEvents: string,
  ): Promise<PaymentsEntity[]> {
    if (!idEvents) {
      throw AppException.from(APP_ERRORS.payments.idRequired, undefined);
    }

    const payments = await paymentsRepo.find({
      where: { idEvents },
      relations: { paymentItems: true },
      order: { createdAt: "DESC" },
    });

    return payments;
  }
}
