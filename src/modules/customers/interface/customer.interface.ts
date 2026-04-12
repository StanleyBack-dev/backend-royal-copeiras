export interface ICustomer {
  idCustomers: string;
  name: string;
  document: string;
  type: "individual" | "company";
  email?: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
