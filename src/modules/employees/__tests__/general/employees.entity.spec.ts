import { EmployeesEntity } from "../../entities/employees.entity";

describe("EmployeesEntity", () => {
  it("should be defined", () => {
    expect(new EmployeesEntity()).toBeDefined();
  });
});
