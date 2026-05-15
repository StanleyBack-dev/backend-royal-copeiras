import { Injectable } from "@nestjs/common";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import { formatContractDateOnly } from "../../utils/contract-date.util";

@Injectable()
export class BuildContractPdfSnapshotService {
  buildFromEntity(entity: ContractsEntity): ContractPdfSnapshot {
    const contractSnapshot = entity.contractSnapshot ?? {};
    const budgetRelation = entity.budget;
    const leadRelation = entity.lead;
    const budgetSnapshot = this.extractBudgetSnapshot(contractSnapshot);
    const leadSnapshot = this.extractLeadSnapshot(contractSnapshot);

    return {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      contract: {
        idContracts: entity.idContracts,
        idUsers: entity.idUsers,
        idBudgets: entity.idBudgets,
        idLeads: entity.idLeads,
        budgetNumber: entity.budgetNumber,
        contractNumber: entity.contractNumber,
        status: entity.status,
        issueDate: formatContractDateOnly(entity.issueDate),
        validUntil: entity.validUntil
          ? formatContractDateOnly(entity.validUntil)
          : undefined,
        effectiveDate: entity.effectiveDate
          ? formatContractDateOnly(entity.effectiveDate)
          : undefined,
        expiresAt: entity.expiresAt
          ? formatContractDateOnly(entity.expiresAt)
          : undefined,
        body: entity.body,
        notes: entity.notes,
      },
      budget: {
        issueDate: this.getDateValue(
          budgetRelation?.issueDate,
          budgetSnapshot.issueDate,
        ),
        validUntil: this.getDateValue(
          budgetRelation?.validUntil,
          budgetSnapshot.validUntil,
        ),
        eventDates: this.getStringArrayValue(
          budgetRelation?.eventDates,
          budgetSnapshot.eventDates,
        ),
        eventArrivalTimes: this.getStringArrayValue(
          budgetRelation?.eventArrivalTimes,
          (budgetSnapshot as Record<string, unknown>).eventArrivalTimes as
            | string[]
            | undefined,
        ),
        eventDepartureTimes: this.getStringArrayValue(
          budgetRelation?.eventDepartureTimes,
          (budgetSnapshot as Record<string, unknown>).eventDepartureTimes as
            | string[]
            | undefined,
        ),
        eventLocation: this.getStringValue(
          budgetRelation?.eventLocation,
          budgetSnapshot.eventLocation,
        ),
        guestCount: this.getNumberValue(
          budgetRelation?.guestCount,
          (budgetSnapshot as Record<string, unknown>).guestCount as
            | number
            | undefined,
        ),
        durationHours: this.getNumberValue(
          budgetRelation?.durationHours,
          budgetSnapshot.durationHours,
        ),
        paymentMethod: this.getStringValue(
          budgetRelation?.paymentMethod,
          budgetSnapshot.paymentMethod,
        ),
        advancePercentage: this.getNumberValue(
          budgetRelation?.advancePercentage,
          budgetSnapshot.advancePercentage,
        ),
        displacementFee: this.getNumberValue(
          budgetRelation?.displacementFee,
          (budgetSnapshot as Record<string, unknown>).displacementFee as
            | number
            | undefined,
        ),
        totalAmount: this.getNumberValue(
          budgetRelation?.totalAmount,
          budgetSnapshot.totalAmount,
        ),
        items: Array.isArray(budgetRelation?.items)
          ? budgetRelation.items.map((it: any) => ({
              serviceType: it.serviceType,
              quantity: it.quantity,
              description: it.description,
            }))
          : Array.isArray((budgetSnapshot as Record<string, unknown>).items)
            ? ((budgetSnapshot as Record<string, unknown>).items as any[]).map(
                (it) => ({
                  serviceType: (it as any).serviceType,
                  quantity: (it as any).quantity,
                  description: (it as any).description,
                }),
              )
            : [],
      },
      lead: {
        name: this.getStringValue(leadRelation?.name, leadSnapshot.name),
        email: this.getStringValue(leadRelation?.email, leadSnapshot.email),
        phone: this.getStringValue(leadRelation?.phone, leadSnapshot.phone),
        document: this.getStringValue(
          leadRelation?.document,
          leadSnapshot.document,
        ),
      },
    };
  }

  private extractBudgetSnapshot(source: Record<string, unknown>) {
    const budget = source.budget;
    if (!budget || typeof budget !== "object") {
      return {} as Partial<BudgetsEntity>;
    }

    return budget as Partial<BudgetsEntity>;
  }

  private extractLeadSnapshot(source: Record<string, unknown>) {
    const lead = source.lead;
    if (!lead || typeof lead !== "object") {
      return {} as Partial<LeadsEntity>;
    }

    return lead as Partial<LeadsEntity>;
  }

  private getDateValue(
    priority?: Date | string,
    fallback?: Date | string,
  ): string | undefined {
    if (priority) {
      const normalized = formatContractDateOnly(priority);
      return normalized || undefined;
    }

    if (!fallback) {
      return undefined;
    }

    const normalized = formatContractDateOnly(fallback);
    return normalized || undefined;
  }

  private getStringValue(
    priority?: string | null,
    fallback?: string | null,
  ): string | undefined {
    const value = priority ?? fallback;
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed || undefined;
  }

  private getNumberValue(
    priority?: number | null,
    fallback?: number | null,
  ): number | undefined {
    if (typeof priority === "number") {
      return priority;
    }

    if (typeof fallback === "number") {
      return fallback;
    }

    return undefined;
  }

  private getStringArrayValue(
    priority?: string[] | null,
    fallback?: string[] | null,
  ): string[] {
    if (Array.isArray(priority)) {
      return priority;
    }

    if (Array.isArray(fallback)) {
      return fallback;
    }

    return [];
  }
}
