import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { GenerateBudgetPreviewInputDto } from "../../dtos/pdf/generate-budget-preview-input.dto";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetItemsEntity } from "../../entities/budgetItems.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { buildBudgetPdfFileName } from "../../utils/build-budget-pdf-file-name.util";
import { parseBudgetDateOnly } from "../../utils/budget-date.util";
import { GenerateBudgetProposalPdfDocumentService } from "./generate-budget-proposal-pdf-document.service";

@Injectable()
export class GenerateBudgetPreviewPdfService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
    private readonly generateBudgetProposalPdfDocumentService: GenerateBudgetProposalPdfDocumentService,
  ) {}

  async execute(userId: string, input: GenerateBudgetPreviewInputDto) {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const budgetEntity = await this.resolvePreviewSource(userId, input);
    const leadName = await this.resolveLeadName(userId, budgetEntity);
    const document =
      await this.generateBudgetProposalPdfDocumentService.generateFromBudget(
        budgetEntity,
      );

    return {
      fileName: buildBudgetPdfFileName({
        leadName,
        issueDate: budgetEntity.issueDate,
      }),
      mimeType: "application/pdf",
      base64Content: document.pdfBuffer.toString("base64"),
      snapshotHash: document.snapshotHash,
    };
  }

  private async resolveLeadName(
    userId: string,
    budget: BudgetsEntity,
  ): Promise<string | undefined> {
    if (budget.lead?.name) {
      return budget.lead.name;
    }

    if (!budget.idLeads) {
      return undefined;
    }

    const lead = await this.leadsRepository.findOne({
      where: { idLeads: budget.idLeads },
      select: { name: true, idLeads: true, idUsers: true },
    });

    return lead?.name;
  }

  private async resolvePreviewSource(
    userId: string,
    input: GenerateBudgetPreviewInputDto,
  ): Promise<BudgetsEntity> {
    if (input.idBudgets) {
      const record = await this.budgetsRepository.findOne({
        where: {
          idBudgets: input.idBudgets,
        },
        relations: { items: true, lead: true },
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
    const draft = input.draft;

    if (!draft) {
      throw AppException.from(
        APP_ERRORS.budgets.previewSourceRequired,
        undefined,
      );
    }

    if (!draft.items?.length) {
      throw AppException.from(APP_ERRORS.budgets.itemsRequired, undefined);
    }

    const issueDate = parseBudgetDateOnly(draft.issueDate);
    const validUntil = parseBudgetDateOnly(draft.validUntil);

    const items: BudgetItemsEntity[] = draft.items.map((item, index) => {
      const totalPrice = Number((item.quantity * item.unitPrice).toFixed(2));

      return {
        idBudgetItems: `preview-item-${index + 1}`,
        idBudgets: "preview-budget",
        budget: undefined as never,
        idPositions: item.idPositions,
        position: undefined,
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
      eventArrivalTimes: draft.eventArrivalTimes ?? [],
      eventDepartureTimes: draft.eventDepartureTimes ?? [],
      eventLocation: draft.eventLocation,
      guestCount: draft.guestCount,
      durationHours: draft.durationHours,
      paymentMethod: draft.paymentMethod,
      advancePercentage: draft.advancePercentage,
      displacementFee: Number((draft.displacementFee ?? 0).toFixed(2)),
      notes: undefined,
      subtotal,
      totalAmount: Number((draft.totalAmount ?? subtotal).toFixed(2)),
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
