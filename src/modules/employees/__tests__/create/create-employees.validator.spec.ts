import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";

describe("CreateEmployeesInputDto", () => {
  it("should require name, document and idPositions", () => {
    const input = new CreateEmployeesInputDto();
    expect(input.name).toBeUndefined();
    expect(input.document).toBeUndefined();
    expect(input.idPositions).toBeUndefined();
  });

  it("should allow optional fields", () => {
    const input = new CreateEmployeesInputDto();
    input.name = "Funcionario Exemplo";
    input.document = "12345678901";
    input.email = "funcionario@exemplo.com";
    input.phone = "11999999999";
    input.idPositions = "mock-position-id";
    input.isActive = true;

    expect(input.name).toBe("Funcionario Exemplo");
    expect(input.document).toBe("12345678901");
    expect(input.email).toBe("funcionario@exemplo.com");
    expect(input.phone).toBe("11999999999");
    expect(input.idPositions).toBe("mock-position-id");
    expect(input.isActive).toBe(true);
  });
});
