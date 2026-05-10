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
      let shouldPersist = false;

      if (!existing.eventNumber) {
        existing.eventNumber = await this.generateEventNumber(eventsRepo);
        shouldPersist = true;
      }

      if (contract && existing.idCustomers !== contract.idCustomers) {
        existing.idCustomers = contract.idCustomers;
        shouldPersist = true;
      }

      if (shouldPersist) {
        await eventsRepo.save(existing);
      }

      return existing;
    }

    const contract = await contractsRepo.findOne({
      where: { idContracts: contractId },
    });

    if (
      !contract ||
      ![
        ContractStatus.SIGNED,
        ContractStatus.CLOSED_WITHOUT_SIGNATURE,
      ].includes(contract.status)
    ) {
      return null;
    }

    const budget = await budgetsRepo.findOne({
      where: { idBudgets: contract.idBudgets },
      relations: { items: true },
    });

    if (!budget) {
      return null;
    }

    const eventNumber = await this.generateEventNumber(eventsRepo);

    const createdEvent = await eventsRepo.save(
      eventsRepo.create({
        eventNumber,
        idUsers: contract.idUsers,
        idContracts: contract.idContracts,
        idBudgets: contract.idBudgets,
        idLeads: contract.idLeads,
        idCustomers: contract.idCustomers,
        status: EventStatus.SCHEDULED,
        overtimeMinutes: 0,
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

  private async generateEventNumber(
    eventsRepo: Repository<EventEntity>,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EVT-${year}`;

    const totalForYear = await eventsRepo
      .createQueryBuilder("event")
      .where("event.eventNumber LIKE :prefix", {
        prefix: `${prefix}-%`,
      })
      .getCount();

    const sequence = String(totalForYear + 1).padStart(5, "0");
    return `${prefix}-${sequence}`;
  }
}
