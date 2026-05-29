import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { ContractsEntity } from "../../entities/contracts.entity";
import { UpdateContractsInputDto } from "../../dtos/update/update-contracts-input.dto";
import { UpdateContractsResponseDto } from "../../dtos/update/update-contracts-response.dto";
import { IContract } from "../../interface/contract.interface";
import { UpdateContractsValidator } from "../../validators/update/update-contracts.validator";
import { GetSignaturesService } from "../../../signature/services/get-signatures.service";
import { CancelSignatureRequestService } from "../../../signature/services/cancel-signature-request.service";
import { ContractStatus } from "../../enums/contract-status.enum";

@Injectable()
export class UpdateContractsService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly getSignaturesService: GetSignaturesService,
    private readonly cancelSignatureRequestService: CancelSignatureRequestService,
  ) {}

  async execute(
    userId: string,
    input: UpdateContractsInputDto,
  ): Promise<IContract> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const updated = await UpdateContractsValidator.validateAndUpdate(
      userId,
      input,
      this.contractsRepository,
    );

    // If contract was canceled, try to cancel any pending signature envelopes
    try {
      const willBeCanceled =
        input.status === ContractStatus.CANCELED ||
        updated.status === ContractStatus.CANCELED;
      if (willBeCanceled && input.idContracts) {
        try {
          const sigs = await this.getSignaturesService.findAll(userId, {
            idContracts: input.idContracts,
            limit: 100,
          });
          const items = sigs.items || [];
          for (const item of items) {
            if (item.envelopeId) {
              try {
                await this.cancelSignatureRequestService.execute(
                  item.envelopeId,
                );
              } catch {
                // ignore per-envelope errors and continue
              }
            }
          }
        } catch {
          // ignore errors listing signatures
        }
      }
    } catch {
      // swallow to avoid breaking update flow
    }

    return UpdateContractsResponseDto.fromEntity(updated);
  }
}
