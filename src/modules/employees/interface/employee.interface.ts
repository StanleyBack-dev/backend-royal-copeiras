export interface IEmployee {
  idEmployees: string;
  name: string;
  document?: string | null;
  email?: string;
  phone?: string;
  idPositions: string;
  position: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
