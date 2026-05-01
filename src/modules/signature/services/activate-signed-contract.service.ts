import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";
import { CreateCustomerFromSignedContractService } from "../../customers/services/internal/create-customer-from-signed-contract.service";
import { CreateEventFromSignedContractService } from "../../events/services/internal/create-event-from-signed-contract.service";

@Injectable()
export class ActivateSignedContractService {
  constructor(
    private readonly createCustomerFromSignedContractService: CreateCustomerFromSignedContractService,
    private readonly createEventFromSignedContractService: CreateEventFromSignedContractService,
  ) {}

  async execute(contractId: string, manager: EntityManager): Promise<void> {
    await this.createCustomerFromSignedContractService.execute(
      contractId,
      manager,
    );

    await this.createEventFromSignedContractService.execute(
      contractId,
      manager,
    );
  }
}
