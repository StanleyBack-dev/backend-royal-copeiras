import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CreateCustomerFromSignedContractService } from "../../customers/services/internal/create-customer-from-signed-contract.service";
import { CreateEventFromSignedContractService } from "../../events/services/internal/create-event-from-signed-contract.service";
import { CreatePaymentsService } from "../../payments/services/create/create-payments.service";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { BudgetsEntity } from "../../budgets/entities/budgets.entity";
import { PaymentOrigin } from "../../payments/enums/payment-origin.enum";
import { PaymentStatus } from "../../payments/enums/payment-status.enum";

@Injectable()
export class ActivateSignedContractService {
  constructor(
    private readonly createCustomerFromSignedContractService: CreateCustomerFromSignedContractService,
    private readonly createEventFromSignedContractService: CreateEventFromSignedContractService,
    private readonly createPaymentsService: CreatePaymentsService,
  ) {}

  private async createContractPayments(
    contractId: string,
    manager: EntityManager,
    idEvents?: string,
  ): Promise<void> {
    const contractsRepo = manager.getRepository(ContractsEntity);
    const budgetsRepo = manager.getRepository(BudgetsEntity);

    const contract = await contractsRepo.findOne({
      where: { idContracts: contractId },
    });

    if (!contract?.idBudgets || !contract.idLeads) {
      return;
    }

    const budget = await budgetsRepo.findOne({
      where: { idBudgets: contract.idBudgets },
    });

    if (!budget?.totalAmount || budget.totalAmount <= 0) {
      return;
    }

    const advancePercentage = Math.max(
      0,
      Math.min(100, budget.advancePercentage ?? 0),
    );
    const advanceAmount = Number(
      ((budget.totalAmount * advancePercentage) / 100).toFixed(2),
    );
    const remainingAmount = Number(
      (budget.totalAmount - advanceAmount).toFixed(2),
    );

    const paymentItems = [] as Array<{
      origin: PaymentOrigin;
      status: PaymentStatus;
      plannedAmount: number;
      paidAmount: number;
      notes: string;
    }>;

    if (advanceAmount > 0) {
      paymentItems.push({
        origin: PaymentOrigin.BUDGET_ADVANCE,
        status: PaymentStatus.PENDING,
        plannedAmount: advanceAmount,
        paidAmount: 0,
        notes: "Entrada do contrato",
      });
    }

    if (remainingAmount > 0) {
      paymentItems.push({
        origin: PaymentOrigin.BUDGET_TOTAL,
        status: PaymentStatus.PENDING,
        plannedAmount: remainingAmount,
        paidAmount: 0,
        notes: "Saldo restante do contrato",
      });
    }

    if (paymentItems.length > 0) {
      await this.createPaymentsService.executeInternal(
        contract.idUsers,
        {
          idLeads: contract.idLeads,
          idBudgets: contract.idBudgets,
          idContracts: contract.idContracts,
          idEvents,
          paymentItems,
        },
        manager,
      );
    }
  }

  async execute(contractId: string, manager: EntityManager): Promise<void> {
    await this.createCustomerFromSignedContractService.execute(
      contractId,
      manager,
    );

    const event = await this.createEventFromSignedContractService.execute(
      contractId,
      manager,
    );

    await this.createContractPayments(contractId, manager, event?.idEvents);
  }
}
