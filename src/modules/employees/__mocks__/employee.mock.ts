import { EmployeesEntity } from "../entities/employees.entity";
import { UserEntity } from "../../users/entities/user.entity";

export const employeeMock: EmployeesEntity = {
  idEmployees: "mock-employee-id",
  idUsers: "mock-user-id",
  user: { idUsers: "mock-user-id" } as UserEntity,
  name: "Funcionario Exemplo",
  document: "12345678901",
  email: "funcionario@exemplo.com",
  phone: "11999999999",
  position: "Copeira",
  isActive: true,
  createdAt: new Date("2024-04-12T00:00:00Z"),
  updatedAt: new Date("2024-04-12T00:00:00Z"),
};
