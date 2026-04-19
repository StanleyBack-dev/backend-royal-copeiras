import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { UpdateBudgetsInputDto } from "../../dtos/update/update-budgets-input.dto";
import { UpdateBudgetsResponseDto } from "../../dtos/update/update-budgets-response.dto";
import { IBudget } from "../../interface/budget.interface";
import { UpdateBudgetsValidator } from "../../validators/update/update-budgets.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";

@Injectable()
export class UpdateBudgetsService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    @InjectRepository(BudgetItemsEntity)
    private readonly budgetItemsRepository: Repository<BudgetItemsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateBudgetsInputDto,
  ): Promise<IBudget> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const updated = await UpdateBudgetsValidator.validateAndUpdate(
      userId,
      input,
      {
        budgetsRepo: this.budgetsRepository,
        budgetItemsRepo: this.budgetItemsRepository,
        leadsRepo: this.leadsRepository,
      },
    );

    return UpdateBudgetsResponseDto.fromEntity(updated);
  }
}
