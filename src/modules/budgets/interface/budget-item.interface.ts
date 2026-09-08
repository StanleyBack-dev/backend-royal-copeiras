export interface IBudgetItem {
  idBudgetItems: string;
  idPositions?: string | null;
  position?: string | null;
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
