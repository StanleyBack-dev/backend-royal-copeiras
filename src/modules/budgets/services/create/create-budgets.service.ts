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
import { BuildBudgetPdfSnapshotService } from "../pdf/build-budget-pdf-snapshot.service";
import { PdfSnapshotHashService } from "../../../pdf-generator/services/pdf-snapshot-hash.service";

@Injectable()
export class CreateBudgetsService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly buildBudgetPdfSnapshotService: BuildBudgetPdfSnapshotService,
    private readonly pdfSnapshotHashService: PdfSnapshotHashService,
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
    );

    const snapshot = this.buildBudgetPdfSnapshotService.buildFromEntity(
      saved.budget,
    );
    const snapshotHash = this.pdfSnapshotHashService.hashSnapshot(snapshot);

    await this.budgetsRepository.update(saved.budget.idBudgets, {
      pdfSnapshot: snapshot,
      pdfHash: snapshotHash,
    });

    saved.budget.pdfSnapshot = snapshot;
    saved.budget.pdfHash = snapshotHash;

    return CreateBudgetsResponseDto.fromEntity(saved.budget);
  }
}
