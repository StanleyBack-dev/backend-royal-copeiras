import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";

describe("CreateCustomersInputDto", () => {
  it("should require name, document, and type", () => {
    const input = new CreateCustomersInputDto();
    expect(input.name).toBeUndefined();
    expect(input.document).toBeUndefined();
    expect(input.type).toBeUndefined();
  });

  it("should allow optional fields", () => {
    const input = new CreateCustomersInputDto();
    input.name = "Cliente Exemplo";
    input.document = "12345678901";
    input.type = "individual";
    input.email = "cliente@exemplo.com";
    input.phone = "11999999999";
    input.birthDate = "1990-01-01";
    input.address = "Rua Exemplo, 123";
    input.isActive = true;
    expect(input.name).toBe("Cliente Exemplo");
    expect(input.document).toBe("12345678901");
    expect(input.type).toBe("individual");
    expect(input.email).toBe("cliente@exemplo.com");
    expect(input.phone).toBe("11999999999");
    expect(input.birthDate).toBe("1990-01-01");
    expect(input.address).toBe("Rua Exemplo, 123");
    expect(input.isActive).toBe(true);
  });
});
