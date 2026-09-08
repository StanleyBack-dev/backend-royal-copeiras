import { Injectable } from "@nestjs/common";
import { BudgetsEntity } from "../../entities/budgets.entity";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import { formatBudgetDateOnly } from "../../utils/budget-date.util";

@Injectable()
export class BuildBudgetPdfSnapshotService {
  buildFromEntity(entity: BudgetsEntity): BudgetPdfSnapshot {
    return {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      budget: {
        idBudgets: entity.idBudgets,
        idUsers: entity.idUsers,
        idLeads: entity.idLeads,
        budgetNumber: entity.budgetNumber,
        status: entity.status,
        issueDate: formatBudgetDateOnly(entity.issueDate),
        validUntil: formatBudgetDateOnly(entity.validUntil),
        eventDates: entity.eventDates ?? [],
        eventArrivalTimes: entity.eventArrivalTimes ?? [],
        eventDepartureTimes: entity.eventDepartureTimes ?? [],
        eventLocation: entity.eventLocation ?? [],
        guestCount: entity.guestCount ?? [],
        durationHours: entity.durationHours ?? [],
        paymentMethod: entity.paymentMethod,
        advancePercentage: entity.advancePercentage,
        discountType: entity.discountType ?? [],
        discountPercentage: entity.discountPercentage ?? [],
        discountAmount: entity.discountAmount ?? [],
        notes: entity.notes,
        displacementFee: entity.displacementFee ?? [],
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
        eventDateIndex: item.eventDateIndex ?? 0,
      })),
    };
  }
}
