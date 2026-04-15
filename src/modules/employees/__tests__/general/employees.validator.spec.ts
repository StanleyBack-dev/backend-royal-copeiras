import { EmployeesBaseValidator } from "../../validators/base/base-employees.validator";

describe("EmployeesBaseValidator", () => {
  it("should validate cpf document", () => {
    expect(() =>
      EmployeesBaseValidator.validateDocument("12345678901"),
    ).not.toThrow();
    expect(() => EmployeesBaseValidator.validateDocument("123")).toThrow();
  });
});
