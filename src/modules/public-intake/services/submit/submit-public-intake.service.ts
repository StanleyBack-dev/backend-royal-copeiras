import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../../budgets/entities/budget-items.entity";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { normalizeGenderToEnglish } from "../../../budgets/constants/budget-service-types.constant";
import { BudgetStatus } from "../../../budgets/enums/budget-status.enum";
import { generateBudgetNumber } from "../../../budgets/utils/generate-budget-number.util";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { LeadSource } from "../../../leads/enums/lead-source.enum";
import { LeadStatus } from "../../../leads/enums/lead-status.enum";
import { CreateLeadsValidator } from "../../../leads/validators/create/create-leads.validator";
import { PublicBudgetRequestNotificationEmailService } from "../../../mails/services/public-budget-request-notification-email.service";
import { SubmitPublicIntakeInputDto } from "../../dtos/submit/submit-public-intake-input.dto";
import { PublicIntakeCodesService } from "../public-intake-codes.service";

const DRAFT_BUDGET_VALIDITY_DAYS = 15;

@Injectable()
export class SubmitPublicIntakeService {
  private readonly logger = new Logger(SubmitPublicIntakeService.name);

  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly publicIntakeCodesService: PublicIntakeCodesService,
    private readonly publicBudgetRequestNotificationEmailService: PublicBudgetRequestNotificationEmailService,
  ) {}

  async execute(input: SubmitPublicIntakeInputDto) {
    const activeForm = await this.publicIntakeCodesService.findByFormToken(
      input.formToken,
    );

    if (!activeForm || !activeForm.idUsers) {
      throw AppException.from(
        APP_ERRORS.publicIntake.formTokenInvalidOrExpired,
        undefined,
      );
    }

    if (
      input.eventDates.length !== input.eventArrivalTimes.length ||
      input.eventDates.length !== input.eventDepartureTimes.length ||
      input.eventDates.length !== input.eventLocation.length ||
      input.eventDates.length !== input.guestCount.length ||
      input.eventDates.length !== input.durationHours.length
    ) {
      throw AppException.from(
        APP_ERRORS.publicIntake.eventScheduleLengthMismatch,
        undefined,
      );
    }

    const eventDayCount = input.eventDates.length;
    const hasInvalidEventDateIndex = input.items.some(
      (item) =>
        !Number.isInteger(item.eventDateIndex) ||
        item.eventDateIndex < 0 ||
        item.eventDateIndex >= eventDayCount,
    );

    if (hasInvalidEventDateIndex) {
      throw AppException.from(
        APP_ERRORS.budgets.itemEventDateIndexInvalid,
        undefined,
      );
    }

    const coveredDays = new Set(input.items.map((item) => item.eventDateIndex));
    if (coveredDays.size < eventDayCount) {
      throw AppException.from(APP_ERRORS.budgets.dayMissingItems, undefined);
    }

    const operatorId = activeForm.idUsers;

    const { lead, budget, items } =
      await this.leadsRepository.manager.transaction(async (manager) => {
        const leadsRepoTx = manager.getRepository(LeadsEntity);
        const budgetsRepoTx = manager.getRepository(BudgetsEntity);
        const budgetItemsRepoTx = manager.getRepository(BudgetItemsEntity);

        const createdLead = await CreateLeadsValidator.validateAndCreate(
          operatorId,
          {
            name: input.name,
            email: input.email,
            phone: input.phone,
            document: input.document,
            source: LeadSource.PUBLIC_FORM,
            status: LeadStatus.NEW,
            isActive: true,
          },
          leadsRepoTx,
        );

        const issueDate = new Date();
        const validUntil = new Date(issueDate);
        validUntil.setDate(validUntil.getDate() + DRAFT_BUDGET_VALIDITY_DAYS);

        const budgetNumber = await generateBudgetNumber(manager);

        const createdBudget = budgetsRepoTx.create({
          idUsers: operatorId,
          idLeads: createdLead.idLeads,
          budgetNumber,
          status: BudgetStatus.DRAFT,
          issueDate,
          validUntil,
          eventDates: input.eventDates,
          eventArrivalTimes: input.eventArrivalTimes,
          eventDepartureTimes: input.eventDepartureTimes,
          eventLocation: input.eventLocation,
          guestCount: input.guestCount,
          durationHours: input.durationHours,
        });

        const savedBudget = await budgetsRepoTx.save(createdBudget);

        const budgetItems = input.items.map((item, index) =>
          budgetItemsRepoTx.create({
            idBudgets: savedBudget.idBudgets,
            idPositions: null,
            description: item.description,
            serviceGender: normalizeGenderToEnglish(item.gender),
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
            sortOrder: index,
            eventDateIndex: item.eventDateIndex,
          }),
        );

        await budgetItemsRepoTx.save(budgetItems);

        return { lead: createdLead, budget: savedBudget, items: budgetItems };
      });

    await this.publicIntakeCodesService.consume(activeForm, {
      resultingLeadId: lead.idLeads,
      resultingBudgetId: budget.idBudgets,
    });

    try {
      await this.publicBudgetRequestNotificationEmailService.send({
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        leadDocument: lead.document,
        idBudgets: budget.idBudgets,
        budgetNumber: budget.budgetNumber,
        eventDates: budget.eventDates,
        eventArrivalTimes: budget.eventArrivalTimes,
        eventDepartureTimes: budget.eventDepartureTimes,
        eventLocation: budget.eventLocation,
        guestCount: budget.guestCount,
        durationHours: budget.durationHours,
        items: items.map((item) => ({
          description: item.description,
          serviceGender: item.serviceGender,
          quantity: item.quantity,
          eventDateIndex: item.eventDateIndex,
        })),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send public budget request notification email for budget ${budget.idBudgets}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return { idLeads: lead.idLeads, idBudgets: budget.idBudgets };
  }
}
