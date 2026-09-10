import { Injectable } from "@nestjs/common";
import { BudgetsEntity } from "../../../budgets/entities/budgets.entity";
import { LeadsEntity } from "../../../leads/entities/leads.entity";
import { ContractsEntity } from "../../entities/contracts.entity";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import {
  ContractPartySnapshot,
  sanitizeContractParty,
} from "../../interfaces/contract-party.interface";
import { COMPANY_PROFILE_DEFAULTS } from "../../../company-profile/constants/company-profile-defaults.constant";
import { formatContractDateOnly } from "../../utils/contract-date.util";

type BudgetItemLike = {
  itemType?: string;
  serviceType?: string;
  quantity?: number | string;
  description?: string;
  unit?: string | null;
  position?: { idPositions?: string; name?: string } | null;
  supply?: { name?: string } | null;
  supplyName?: string | null;
  serviceGender?: string | null;
  eventDateIndex?: number;
};

@Injectable()
export class BuildContractPdfSnapshotService {
  buildFromEntity(entity: ContractsEntity): ContractPdfSnapshot {
    const contractSnapshot = entity.contractSnapshot ?? {};
    const budgetRelation = entity.budget;
    const leadRelation = entity.lead;
    const budgetSnapshot = this.extractBudgetSnapshot(contractSnapshot);
    const leadSnapshot = this.extractLeadSnapshot(contractSnapshot);
    const contractorSnapshot = this.extractContractorSnapshot(contractSnapshot);

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
        eventLocation: this.getStringArrayValue(
          budgetRelation?.eventLocation,
          budgetSnapshot.eventLocation,
        ),
        guestCount: this.getNumberArrayValue(
          budgetRelation?.guestCount,
          budgetSnapshot.guestCount,
        ),
        durationHours: this.getNumberArrayValue(
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
        displacementFee: this.getNumberArrayValue(
          budgetRelation?.displacementFee,
          (budgetSnapshot as Record<string, unknown>).displacementFee as
            | number[]
            | undefined,
        ),
        totalAmount: this.getNumberValue(
          budgetRelation?.totalAmount,
          budgetSnapshot.totalAmount,
        ),
        items: Array.isArray(budgetRelation?.items)
          ? (budgetRelation.items as unknown as BudgetItemLike[]).map((it) =>
              this.mapBudgetItem(it),
            )
          : Array.isArray((budgetSnapshot as Record<string, unknown>).items)
            ? (
                (budgetSnapshot as Record<string, unknown>)
                  .items as BudgetItemLike[]
              ).map((it) => this.mapBudgetItem(it))
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
        legalName: this.getStringValue(
          leadRelation?.legalName,
          leadSnapshot.legalName,
        ),
        address: this.getStringValue(
          leadRelation?.address,
          leadSnapshot.address,
        ),
        addressStreet: this.getStringValue(
          leadRelation?.addressStreet,
          leadSnapshot.addressStreet,
        ),
        addressNumber: this.getStringValue(
          leadRelation?.addressNumber,
          leadSnapshot.addressNumber,
        ),
        addressComplement: this.getStringValue(
          leadRelation?.addressComplement,
          leadSnapshot.addressComplement,
        ),
        addressNeighborhood: this.getStringValue(
          leadRelation?.addressNeighborhood,
          leadSnapshot.addressNeighborhood,
        ),
        addressCity: this.getStringValue(
          leadRelation?.addressCity,
          leadSnapshot.addressCity,
        ),
        addressState: this.getStringValue(
          leadRelation?.addressState,
          leadSnapshot.addressState,
        ),
        addressZipCode: this.getStringValue(
          leadRelation?.addressZipCode,
          leadSnapshot.addressZipCode,
        ),
      },
      contractor: contractorSnapshot,
    };
  }

  private mapBudgetItem(it: BudgetItemLike) {
    const isSupply = it.itemType === "SUPPLY";
    return {
      itemType: isSupply ? "SUPPLY" : "LABOR",
      // Prefer the human-readable cargo name so the clause fragment and the
      // grammatical gender resolve correctly (the id would never match).
      serviceType: isSupply
        ? undefined
        : (it.position?.name ?? it.serviceType ?? undefined),
      quantity:
        typeof it.quantity === "number"
          ? it.quantity
          : Number(it.quantity) || 0,
      description: it.description ?? "",
      unit: it.unit ?? null,
      supplyName: it.supply?.name ?? it.supplyName ?? null,
      eventDateIndex: it.eventDateIndex ?? 0,
    };
  }

  private extractContractorSnapshot(
    source: Record<string, unknown>,
  ): ContractPartySnapshot {
    const stored = sanitizeContractParty(
      source.contractor as ContractPartySnapshot | undefined,
    );

    // Legacy contracts (without a contractor in the snapshot) fall back to the
    // company default values so the generated PDF stays consistent.
    return {
      ...COMPANY_PROFILE_DEFAULTS,
      ...stored,
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

  private getNumberArrayValue(
    priority?: number[] | null,
    fallback?: number[] | null,
  ): number[] {
    if (Array.isArray(priority)) {
      return priority;
    }

    if (Array.isArray(fallback)) {
      return fallback;
    }

    return [];
  }
}
