import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { ContractsEntity } from "../../../contracts/entities/contracts.entity";
import { ContractStatus } from "../../../contracts/enums/contract-status.enum";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { EventEntity } from "../../entities/event.entity";
import { EventStatus } from "../../enums/event-status.enum";
import { EventAssignmentEntity } from "../../entities/event-assignment.entity";

@Injectable()
export class CreateEventFromSignedContractService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    @InjectRepository(EventAssignmentEntity)
    private readonly eventAssignmentsRepository: Repository<EventAssignmentEntity>,
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
  ) {}

  async execute(
    contractId: string,
    manager?: EntityManager,
  ): Promise<EventEntity | null> {
    const eventsRepo = manager
      ? manager.getRepository(EventEntity)
      : this.eventsRepository;
    const eventAssignmentsRepo = manager
      ? manager.getRepository(EventAssignmentEntity)
      : this.eventAssignmentsRepository;
    const contractsRepo = manager
      ? manager.getRepository(ContractsEntity)
      : this.contractsRepository;
    const budgetsRepo = manager
      ? manager.getRepository(BudgetsEntity)
      : this.budgetsRepository;

    const existing = await eventsRepo.findOne({
      where: { idContracts: contractId },
    });
    if (existing) {
      const contract = await contractsRepo.findOne({
        where: { idContracts: contractId },
      });
      if (contract && existing.idCustomers !== contract.idCustomers) {
        existing.idCustomers = contract.idCustomers;
        await eventsRepo.save(existing);
      }
      return existing;
    }

    const contract = await contractsRepo.findOne({
      where: { idContracts: contractId },
    });

    if (!contract || contract.status !== ContractStatus.SIGNED) {
      return null;
    }

    const budget = await budgetsRepo.findOne({
      where: { idBudgets: contract.idBudgets },
      relations: { items: true },
    });

    if (!budget) {
      return null;
    }

    const createdEvent = await eventsRepo.save(
      eventsRepo.create({
        idUsers: contract.idUsers,
        idContracts: contract.idContracts,
        idBudgets: contract.idBudgets,
        idLeads: contract.idLeads,
        idCustomers: contract.idCustomers,
        status: EventStatus.SCHEDULED,
      }),
    );

    const assignments: EventAssignmentEntity[] = [];
    const sortedItems = [...(budget.items ?? [])].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    for (const item of sortedItems) {
      const quantity =
        Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      for (let index = 0; index < quantity; index += 1) {
        assignments.push(
          eventAssignmentsRepo.create({
            idEvents: createdEvent.idEvents,
            idBudgetItems: item.idBudgetItems,
            allocationIndex: index + 1,
            employeePayment: 0,
            isActive: true,
          }),
        );
      }
    }

    if (assignments.length > 0) {
      await eventAssignmentsRepo.save(assignments);
    }

    return createdEvent;
  }
}
