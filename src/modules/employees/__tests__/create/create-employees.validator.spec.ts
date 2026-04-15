import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";

describe("CreateEmployeesInputDto", () => {
  it("should require name, document and position", () => {
    const input = new CreateEmployeesInputDto();
    expect(input.name).toBeUndefined();
    expect(input.document).toBeUndefined();
    expect(input.position).toBeUndefined();
  });

  it("should allow optional fields", () => {
    const input = new CreateEmployeesInputDto();
    input.name = "Funcionario Exemplo";
    input.document = "12345678901";
    input.email = "funcionario@exemplo.com";
    input.phone = "11999999999";
    input.position = "Copeira";
    input.isActive = true;

    expect(input.name).toBe("Funcionario Exemplo");
    expect(input.document).toBe("12345678901");
    expect(input.email).toBe("funcionario@exemplo.com");
    expect(input.phone).toBe("11999999999");
    expect(input.position).toBe("Copeira");
    expect(input.isActive).toBe(true);
  });
});
