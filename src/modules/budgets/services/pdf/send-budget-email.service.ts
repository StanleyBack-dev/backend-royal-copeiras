import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import type { IMailProvider } from "../../../mails/contracts/mail-provider.contract";
import { MAIL_PROVIDER_TOKEN } from "../../../mails/contracts/mail.tokens";
import { buildBudgetProposalEmail } from "../../../mails/templates/budgets/budget-proposal-email.template";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { buildBudgetPdfFileName } from "../../utils/build-budget-pdf-file-name.util";
import { GenerateBudgetProposalPdfDocumentService } from "./generate-budget-proposal-pdf-document.service";

export interface SendBudgetEmailInput {
  idBudgets: string;
}

@Injectable()
export class SendBudgetEmailService {
  constructor(
    @InjectRepository(BudgetsEntity)
    private readonly budgetsRepository: Repository<BudgetsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
    @Inject(MAIL_PROVIDER_TOKEN)
    private readonly mailProvider: IMailProvider,
    private readonly configService: ConfigService,
    private readonly generateBudgetProposalPdfDocumentService: GenerateBudgetProposalPdfDocumentService,
  ) {}

  async execute(userId: string, input: SendBudgetEmailInput): Promise<void> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const budget = await this.budgetsRepository.findOne({
      where: { idBudgets: input.idBudgets, idUsers: userId },
      relations: { items: true },
    });

    if (!budget) {
      throw AppException.from(APP_ERRORS.budgets.notFound, undefined);
    }

    if (!budget.idLeads) {
      throw AppException.from(APP_ERRORS.budgets.leadRequired, undefined);
    }

    if (budget.status !== BudgetStatus.GENERATED) {
      throw AppException.from(
        APP_ERRORS.budgets.invalidStatusTransition,
        undefined,
      );
    }

    const lead = await this.leadsRepository.findOne({
      where: { idLeads: budget.idLeads, idUsers: userId },
    });

    if (!lead) {
      throw AppException.from(APP_ERRORS.leads.notFound, undefined);
    }

    if (!lead.email) {
      throw AppException.from(APP_ERRORS.budgets.leadHasNoEmail, undefined);
    }

    const items = [...(budget.items ?? [])].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    const template = buildBudgetProposalEmail({
      leadName: lead.name,
      budgetNumber: budget.budgetNumber,
      issueDate:
        budget.issueDate instanceof Date
          ? budget.issueDate.toISOString()
          : String(budget.issueDate),
      validUntil:
        budget.validUntil instanceof Date
          ? budget.validUntil.toISOString()
          : String(budget.validUntil),
      eventLocation: budget.eventLocation,
      eventDates: budget.eventDates,
      guestCount: budget.guestCount,
      durationHours: budget.durationHours,
      advancePercentage: budget.advancePercentage,
      subtotal: budget.subtotal,
      totalAmount: budget.totalAmount,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      })),
    });

    try {
      const document =
        await this.generateBudgetProposalPdfDocumentService.generateFromBudget(
          budget,
        );

      await this.mailProvider.send({
        to: { email: lead.email, name: lead.name },
        subject: template.subject,
        html: template.html,
        text: template.text,
        replyTo: this.buildReplyTo(),
        attachments: [
          {
            name: buildBudgetPdfFileName({
              leadName: lead.name,
              issueDate: budget.issueDate,
            }),
            content: document.pdfBuffer.toString("base64"),
            type: "application/pdf",
          },
        ],
      });
    } catch {
      throw AppException.from(APP_ERRORS.budgets.emailSendFailed, undefined);
    }

    await this.budgetsRepository.update(budget.idBudgets, {
      status: BudgetStatus.SENT,
      sentVia: "email",
      sentAt: new Date(),
    });
  }

  private buildReplyTo() {
    const replyToEmail = this.configService.get<string>("MAIL_REPLY_TO_EMAIL");
    if (!replyToEmail) {
      return undefined;
    }

    return {
      email: replyToEmail,
      name:
        this.configService.get<string>("MAIL_REPLY_TO_NAME") ||
        this.configService.get<string>("MAIL_FROM_NAME") ||
        "Royal Copeiras",
    };
  }
}
