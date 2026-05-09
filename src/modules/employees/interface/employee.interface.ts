import { EmployeeGender } from "../enums/employee-gender.enum";

export interface IEmployee {
  idEmployees: string;
  name: string;
  gender?: EmployeeGender | null;
  document?: string | null;
  email?: string;
  phone?: string;
  idPositions: string;
  position: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}
