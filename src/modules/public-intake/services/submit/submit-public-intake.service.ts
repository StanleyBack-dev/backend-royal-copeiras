import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { BudgetItemsEntity } from "../../../budgets/entities/budget-items.entity";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";
import { normalizeGenderToEnglish } from "../../../budgets/constants/budget-service-types.constant";
import { BudgetItemType } from "../../../budgets/enums/budget-item-type.enum";
import { BudgetStatus } from "../../../budgets/enums/budget-status.enum";
import { generateBudgetNumber } from "../../../budgets/utils/generate-budget-number.util";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { LeadSource } from "../../../leads/enums/lead-source.enum";
import { LeadStatus } from "../../../leads/enums/lead-status.enum";
import { CreateLeadsValidator } from "../../../leads/validators/create/create-leads.validator";
import { findDuplicateLead } from "../../../leads/validators/base/lead-duplicate.util";
import { PublicBudgetRequestNotificationEmailService } from "../../../mails/services/public-budget-request-notification-email.service";
import { SubmitPublicIntakeInputDto } from "../../dtos/submit/submit-public-intake-input.dto";
import { PublicIntakeCodesService } from "../public-intake-codes.service";

const DRAFT_BUDGET_VALIDITY_DAYS = 15;
// Payment terms the public form doesn't collect — set on creation so the draft
// is contract-ready by default. "PIX" must match BUDGET_ALLOWED_PAYMENT_METHODS.
const DEFAULT_PUBLIC_BUDGET_PAYMENT_METHOD = "PIX";
const DEFAULT_PUBLIC_BUDGET_ADVANCE_PERCENTAGE = 30;

@Injectable()
export class SubmitPublicIntakeService {
  private readonly logger = new Logger(SubmitPublicIntakeService.name);

  constructor(
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly publicIntakeCodesService: PublicIntakeCodesService,
    private readonly publicBudgetRequestNotificationEmailService: PublicBudgetRequestNotificationEmailService,
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
  ) {}

  /**
   * Loads the catalog materials referenced by SUPPLY items, keyed by id, and
   * asserts each belongs to this operator and is active — the public form
   * submits only catalog ids so name/unit come from the catalog, never the
   * client payload.
   */
  private async resolveSupplies(
    input: SubmitPublicIntakeInputDto,
    operatorId: string,
  ): Promise<Map<string, SuppliesEntity>> {
    const supplyIds = Array.from(
      new Set(
        input.items
          .filter(
            (item) =>
              item.itemType === BudgetItemType.SUPPLY && item.idSupplies,
          )
          .map((item) => item.idSupplies as string),
      ),
    );

    if (!supplyIds.length) {
      return new Map();
    }

    const supplies = await this.suppliesRepository.find({
      where: { idSupplies: In(supplyIds), idUsers: operatorId },
    });
    const byId = new Map(supplies.map((supply) => [supply.idSupplies, supply]));

    if (supplyIds.some((id) => !byId.has(id))) {
      throw AppException.from(APP_ERRORS.budgets.itemSupplyNotFound, undefined);
    }
    if (supplyIds.some((id) => !byId.get(id)?.isActive)) {
      throw AppException.from(APP_ERRORS.budgets.itemSupplyInactive, undefined);
    }

    return byId;
  }

  /**
   * The structured address fields the public form now collects, plus the
   * legacy free-text `address` composed from them (kept in sync exactly like
   * the lead form does, so the contract PDF fallback still works).
   */
  private buildLeadAddress(input: SubmitPublicIntakeInputDto) {
    const parts = [
      input.addressStreet?.trim(),
      input.addressNumber?.trim(),
      input.addressComplement?.trim(),
      input.addressNeighborhood?.trim(),
    ].filter((value): value is string => Boolean(value));

    return {
      address: parts.length ? parts.join(", ") : undefined,
      addressStreet: input.addressStreet?.trim() || undefined,
      addressNumber: input.addressNumber?.trim() || undefined,
      addressComplement: input.addressComplement?.trim() || undefined,
      addressNeighborhood: input.addressNeighborhood?.trim() || undefined,
      addressCity: input.addressCity?.trim() || undefined,
      addressState: input.addressState?.trim().toUpperCase() || undefined,
      addressZipCode: input.addressZipCode?.trim() || undefined,
    };
  }

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
    const suppliesById = await this.resolveSupplies(input, operatorId);

    const { lead, budget, items } =
      await this.leadsRepository.manager.transaction(async (manager) => {
        const leadsRepoTx = manager.getRepository(LeadsEntity);
        const budgetsRepoTx = manager.getRepository(BudgetsEntity);
        const budgetItemsRepoTx = manager.getRepository(BudgetItemsEntity);

        // A returning client submitting the public form again must not spawn a
        // duplicate lead — reuse the existing record and top up any missing
        // contact fields instead.
        const existingLead = await findDuplicateLead(leadsRepoTx, {
          name: input.name,
          document: input.document,
        });

        const address = this.buildLeadAddress(input);

        const createdLead = existingLead
          ? await leadsRepoTx.save(
              Object.assign(existingLead, {
                email: existingLead.email ?? input.email,
                phone: existingLead.phone ?? input.phone,
                document: existingLead.document ?? input.document,
                // Only fill address fields the existing lead is missing.
                address: existingLead.address ?? address.address,
                addressStreet:
                  existingLead.addressStreet ?? address.addressStreet,
                addressNumber:
                  existingLead.addressNumber ?? address.addressNumber,
                addressComplement:
                  existingLead.addressComplement ?? address.addressComplement,
                addressNeighborhood:
                  existingLead.addressNeighborhood ??
                  address.addressNeighborhood,
                addressCity: existingLead.addressCity ?? address.addressCity,
                addressState: existingLead.addressState ?? address.addressState,
                addressZipCode:
                  existingLead.addressZipCode ?? address.addressZipCode,
                isActive: true,
              }),
            )
          : await CreateLeadsValidator.validateAndCreate(
              operatorId,
              {
                name: input.name,
                email: input.email,
                phone: input.phone,
                document: input.document,
                ...address,
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
          // The public form doesn't ask for payment terms — default them so the
          // operator only has to review/adjust, not fill from scratch.
          paymentMethod: DEFAULT_PUBLIC_BUDGET_PAYMENT_METHOD,
          advancePercentage: DEFAULT_PUBLIC_BUDGET_ADVANCE_PERCENTAGE,
        });

        const savedBudget = await budgetsRepoTx.save(createdBudget);

        const budgetItems = input.items.map((item, index) => {
          const isSupply = item.itemType === BudgetItemType.SUPPLY;
          const supply =
            isSupply && item.idSupplies
              ? suppliesById.get(item.idSupplies)
              : undefined;
          return budgetItemsRepoTx.create({
            idBudgets: savedBudget.idBudgets,
            itemType: isSupply ? BudgetItemType.SUPPLY : BudgetItemType.LABOR,
            idPositions: null,
            idSupplies: supply?.idSupplies ?? null,
            // Catalog-linked material: name and unit come from the catalog.
            unit: isSupply
              ? (supply?.defaultUnit?.trim() ?? item.unit?.trim() ?? null)
              : null,
            description: supply?.name ?? item.description,
            serviceGender: isSupply
              ? null
              : normalizeGenderToEnglish(item.gender),
            quantity: item.quantity,
            unitPrice: 0,
            totalPrice: 0,
            sortOrder: index,
            eventDateIndex: item.eventDateIndex,
          });
        });

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
