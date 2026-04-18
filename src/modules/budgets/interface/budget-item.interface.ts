export interface IBudgetItem {
  idBudgetItems: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
