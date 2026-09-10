import { BudgetItemType } from "../enums/budget-item-type.enum";

export interface IBudgetItem {
  idBudgetItems: string;
  itemType: BudgetItemType;
  idPositions?: string | null;
  position?: string | null;
  idSupplies?: string | null;
  supply?: string | null;
  unit?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sortOrder: number;
  eventDateIndex: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
