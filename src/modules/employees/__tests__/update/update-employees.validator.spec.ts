import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";

describe("UpdateEmployeesInputDto", () => {
  it("should require idEmployees", () => {
    const input = new UpdateEmployeesInputDto();
    expect(input.idEmployees).toBeUndefined();
  });

  it("should allow partial update", () => {
    const input = new UpdateEmployeesInputDto();
    input.idEmployees = "uuid-mock";
    input.name = "Novo Funcionario";

    expect(input.idEmployees).toBe("uuid-mock");
    expect(input.name).toBe("Novo Funcionario");
  });
});
