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

@Injectable()
export class UpdateContractsService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    private readonly authorizationService: AuthorizationService,
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

    return UpdateContractsResponseDto.fromEntity(updated);
  }
}
