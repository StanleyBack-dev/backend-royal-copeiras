import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { ContractsEntity } from "../../entities/contracts.entity";
import { CreateContractsInputDto } from "../../dtos/create/create-contracts-input.dto";
import { CreateContractsResponseDto } from "../../dtos/create/create-contracts-response.dto";
import { IContract } from "../../interface/contract.interface";
import { CreateContractsValidator } from "../../validators/create/create-contracts.validator";

@Injectable()
export class CreateContractsService {
  constructor(
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreateContractsInputDto,
  ): Promise<IContract> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const created = await CreateContractsValidator.validateAndCreate(
      userId,
      input,
      this.contractsRepository,
      this.budgetsRepository,
    );

    return CreateContractsResponseDto.fromEntity(created);
  }
}
