import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PdfTemplateKey } from "../../../pdf-generator/enums/pdf-template-key.enum";
import { PdfGeneratorService } from "../../../pdf-generator/services/pdf-generator.service";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import { DownloadBudgetPdfInputDto } from "../../dtos/pdf/download-budget-pdf-input.dto";
import { MapBudgetPdfDrawTextsService } from "./map-budget-pdf-draw-texts.service";

@Injectable()
export class DownloadBudgetPdfService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly mapBudgetPdfDrawTextsService: MapBudgetPdfDrawTextsService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(userId: string, input: DownloadBudgetPdfInputDto) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const budget = await this.budgetsRepository.findOne({
      where: { idBudgets: input.idBudgets, idUsers: userId },
    });

    if (!budget) {
      throw AppException.from(APP_ERRORS.budgets.notFound, undefined);
    }

    if (!budget.pdfFrozenAt || !budget.pdfSnapshot || !budget.pdfHash) {
      throw AppException.from(APP_ERRORS.budgets.notFrozen, undefined);
    }

    const snapshot = budget.pdfSnapshot as BudgetPdfSnapshot;
    const snapshotHash = budget.pdfHash;

    const drawTexts = this.mapBudgetPdfDrawTextsService.map(
      snapshot,
      snapshotHash,
    );

    const pdfBuffer = await this.pdfGeneratorService.generateFromTemplate({
      templateKey: PdfTemplateKey.BUDGETS,
      drawTexts,
    });

    return {
      fileName: `${snapshot.budget.budgetNumber}.pdf`,
      mimeType: "application/pdf",
      base64Content: pdfBuffer.toString("base64"),
      snapshotHash,
      frozenAt: budget.pdfFrozenAt.toISOString(),
    };
  }
}
