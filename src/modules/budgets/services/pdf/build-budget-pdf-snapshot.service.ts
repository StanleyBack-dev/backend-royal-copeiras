import { Injectable } from "@nestjs/common";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";

@Injectable()
export class BuildBudgetPdfSnapshotService {
  buildFromEntity(entity: BudgetsEntity): BudgetPdfSnapshot {
    const toIso = (value: Date | string) =>
      value instanceof Date ? value.toISOString() : String(value);

    return {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      budget: {
        idBudgets: entity.idBudgets,
        idUsers: entity.idUsers,
        idLeads: entity.idLeads,
        budgetNumber: entity.budgetNumber,
        status: entity.status,
        issueDate: toIso(entity.issueDate),
        validUntil: toIso(entity.validUntil),
        eventDates: entity.eventDates ?? [],
        eventLocation: entity.eventLocation,
        guestCount: entity.guestCount,
        durationHours: entity.durationHours,
        paymentMethod: entity.paymentMethod,
        advancePercentage: entity.advancePercentage,
        notes: entity.notes,
        subtotal: entity.subtotal,
        totalAmount: entity.totalAmount,
      },
      items: (entity.items ?? []).map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
        sortOrder: item.sortOrder,
      })),
    };
  }
}
