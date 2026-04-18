import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PdfTemplateKey } from "../../../pdf-generator/enums/pdf-template-key.enum";
import { PdfGeneratorService } from "../../../pdf-generator/services/pdf-generator.service";
import { PdfSnapshotHashService } from "../../../pdf-generator/services/pdf-snapshot-hash.service";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { GenerateBudgetPreviewInputDto } from "../../dtos/pdf/generate-budget-preview-input.dto";
import { BuildBudgetPdfSnapshotService } from "./build-budget-pdf-snapshot.service";
import { MapBudgetPdfDrawTextsService } from "./map-budget-pdf-draw-texts.service";

@Injectable()
export class GenerateBudgetPreviewPdfService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly buildBudgetPdfSnapshotService: BuildBudgetPdfSnapshotService,
    private readonly mapBudgetPdfDrawTextsService: MapBudgetPdfDrawTextsService,
    private readonly pdfSnapshotHashService: PdfSnapshotHashService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(userId: string, input: GenerateBudgetPreviewInputDto) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const budgetEntity = await this.resolvePreviewSource(userId, input);
    const snapshot =
      this.buildBudgetPdfSnapshotService.buildFromEntity(budgetEntity);
    const snapshotHash = this.pdfSnapshotHashService.hashSnapshot(snapshot);

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
    };
  }

  private async resolvePreviewSource(
    userId: string,
    input: GenerateBudgetPreviewInputDto,
  ): Promise<BudgetsEntity> {
    if (input.idBudgets) {
      const record = await this.budgetsRepository.findOne({
        where: {
          idBudgets: input.idBudgets,
          idUsers: userId,
        },
        relations: { items: true },
      });

      if (!record) {
        throw AppException.from(APP_ERRORS.budgets.notFound, undefined);
      }

      return record;
    }

    if (input.draft) {
      return this.buildDraftPreviewEntity(userId, input);
    }

    throw AppException.from(
      APP_ERRORS.budgets.previewSourceRequired,
      undefined,
    );
  }

  private buildDraftPreviewEntity(
    userId: string,
    input: GenerateBudgetPreviewInputDto,
  ): BudgetsEntity {
    const draft = input.draft!;

    if (!draft.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    const issueDate = draft.issueDate ? new Date(draft.issueDate) : new Date();
    const validUntil = new Date(draft.validUntil);

    const items: BudgetItemsEntity[] = draft.items.map((item, index) => {
      const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));

      return {
        idBudgetItems: `preview-item-${index + 1}`,
        idBudgets: "preview-budget",
        budget: undefined as never,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes,
        sortOrder: item.sortOrder ?? index,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const subtotal = Number(
      items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
    );

    const totalAmount = Number((draft.totalAmount ?? subtotal).toFixed(2));

    return {
      idBudgets: "preview-budget",
      user: undefined as never,
      idUsers: userId,
      lead: undefined,
      idLeads: draft.idLeads,
      budgetNumber: input.budgetNumber || "BUDGET-PREVIEW",
      status: draft.status || BudgetStatus.DRAFT,
      issueDate,
      validUntil,
      eventDates: draft.eventDates ?? [],
      eventLocation: draft.eventLocation,
      guestCount: draft.guestCount,
      durationHours: draft.durationHours,
      paymentMethod: draft.paymentMethod,
      advancePercentage: draft.advancePercentage,
      notes: draft.notes,
      subtotal,
      totalAmount,
      pdfUrl: undefined,
      pdfHash: undefined,
      pdfSnapshot: undefined,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
