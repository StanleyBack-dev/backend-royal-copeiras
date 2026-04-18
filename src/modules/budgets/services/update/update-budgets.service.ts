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
import { BuildBudgetPdfSnapshotService } from "../pdf/build-budget-pdf-snapshot.service";
import { PdfSnapshotHashService } from "../../../pdf-generator/services/pdf-snapshot-hash.service";

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
    private readonly buildBudgetPdfSnapshotService: BuildBudgetPdfSnapshotService,
    private readonly pdfSnapshotHashService: PdfSnapshotHashService,
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

    const snapshot =
      this.buildBudgetPdfSnapshotService.buildFromEntity(updated);
    const snapshotHash = this.pdfSnapshotHashService.hashSnapshot(snapshot);

    await this.budgetsRepository.update(updated.idBudgets, {
      pdfSnapshot: snapshot,
      pdfHash: snapshotHash,
    });

    updated.pdfSnapshot = snapshot;
    updated.pdfHash = snapshotHash;

    return UpdateBudgetsResponseDto.fromEntity(updated);
  }
}
