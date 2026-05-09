export interface IPosition {
  idPositions: string;
  name: string;
  normalizedName?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
