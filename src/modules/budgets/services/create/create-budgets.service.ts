import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { CreateBudgetsInputDto } from "../../dtos/create/create-budgets-input.dto";
import { CreateBudgetsResponseDto } from "../../dtos/create/create-budgets-response.dto";
import { IBudget } from "../../interface/budget.interface";
import { CreateBudgetsValidator } from "../../validators/create/create-budgets.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";

@Injectable()
export class CreateBudgetsService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    @InjectRepository(PositionsEntity)
    private readonly positionsRepository: Repository<PositionsEntity>,
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreateBudgetsInputDto,
  ): Promise<IBudget> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const saved = await CreateBudgetsValidator.validateAndCreate(
      userId,
      input,
      this.budgetsRepository,
      this.leadsRepository,
      this.positionsRepository,
      this.suppliesRepository,
    );

    return CreateBudgetsResponseDto.fromEntity(saved.budget);
  }
}
