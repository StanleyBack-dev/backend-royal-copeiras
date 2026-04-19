import { BudgetsEntity } from "../entities/budgets.entity";
import { BudgetItemsEntity } from "../entities/budgetItems.entity";
import { BudgetStatus } from "../enums/budget-status.enum";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";

export const budgetItemMock: BudgetItemsEntity = {
  idBudgetItems: "item-1",
  idBudgets: "budget-1",
  budget: { idBudgets: "budget-1" } as BudgetsEntity,
  description: "Item antigo",
  quantity: 1,
  unitPrice: 1000,
  totalPrice: 1000,
  notes: undefined,
  sortOrder: 0,
  createdAt: new Date("2026-04-10"),
  updatedAt: new Date("2026-04-10"),
};

export const budgetMock: BudgetsEntity = {
  idBudgets: "budget-1",
  idUsers: "user-1",
  user: { idUsers: "user-1" } as UserEntity,
  idLeads: "lead-1",
  lead: { idLeads: "lead-1" } as LeadsEntity,
  budgetNumber: "ORC-2026-00001",
  status: BudgetStatus.DRAFT,
  issueDate: new Date("2026-04-10"),
  validUntil: new Date("2026-04-20"),
  eventDates: ["2026-04-19"],
  eventLocation: "Polo Empresarial",
  guestCount: 150,
  durationHours: 6,
  paymentMethod: "PIX",
  advancePercentage: 30,
  notes: "obs",
  subtotal: 1000,
  totalAmount: 1000,
  items: [budgetItemMock],
  createdAt: new Date("2026-04-10"),
  updatedAt: new Date("2026-04-10"),
};
