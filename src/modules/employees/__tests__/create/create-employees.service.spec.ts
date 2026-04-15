import { Test, TestingModule } from "@nestjs/testing";
import { CreateEmployeesService } from "../../services/create/create-employees.service";
import { employeeMock } from "../../__mocks__/employee.mock";

describe("CreateEmployeesService", () => {
  let service: CreateEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(employeeMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CreateEmployeesService, useValue: serviceMock }],
    }).compile();

    service = module.get<CreateEmployeesService>(CreateEmployeesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create an employee with all fields", async () => {
    const input = {
      name: "Funcionario Exemplo",
      document: "12345678901",
      email: "funcionario@exemplo.com",
      phone: "11999999999",
      position: "Copeira",
      isActive: true,
    };

    const result = await service.execute("user-id-test", input);
    expect(result).toEqual(employeeMock);
  });

  it("should throw error for duplicate document", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Ja existe um funcionario com este documento."),
    );

    await expect(
      service.execute("user-id-test", {
        name: "Funcionario Exemplo",
        document: "12345678901",
        position: "Copeira",
        isActive: true,
      }),
    ).rejects.toThrow("Ja existe um funcionario com este documento.");
  });
});
