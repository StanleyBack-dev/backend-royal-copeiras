import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { ActivateSignedContractService } from "../../../signature/services/activate-signed-contract.service";
import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractsEntity } from "../../entities/contracts.entity";

export interface CloseContractWithoutSignatureInput {
  idContracts: string;
}

@Injectable()
export class CloseContractWithoutSignatureService {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly activateSignedContractService: ActivateSignedContractService,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
    userId: string,
    input: CloseContractWithoutSignatureInput,
  ): Promise<void> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    await this.dataSource.transaction(async (manager) => {
      const contractsRepo = manager.getRepository(ContractsEntity);

      const contract = await contractsRepo.findOne({
        where: { idContracts: input.idContracts },
      });

      if (!contract) {
        throw AppException.from(APP_ERRORS.contracts.notFound, undefined);
      }

      if (
        ![ContractStatus.GENERATED, ContractStatus.PENDING_SIGNATURE].includes(
          contract.status,
        )
      ) {
        throw AppException.from(
          APP_ERRORS.contracts.invalidStatusTransition,
          undefined,
        );
      }

      contract.status = ContractStatus.CLOSED_WITHOUT_SIGNATURE;
      contract.sentVia = "manual_close";
      contract.sentAt = new Date();
      await contractsRepo.save(contract);

      await this.activateSignedContractService.execute(
        contract.idContracts,
        manager,
      );
    });
  }
}
