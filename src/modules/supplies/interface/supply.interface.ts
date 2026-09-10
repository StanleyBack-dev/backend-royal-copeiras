export interface ISupply {
  idSupplies: string;
  name: string;
  normalizedName?: string;
  defaultUnit?: string | null;
  suggestedUnitPrice?: number | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
