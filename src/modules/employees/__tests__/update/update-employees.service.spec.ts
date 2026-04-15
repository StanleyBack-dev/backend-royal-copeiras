import { Test, TestingModule } from "@nestjs/testing";
import { UpdateEmployeesService } from "../../services/update/update-employees.service";
import { employeeMock } from "../../__mocks__/employee.mock";

describe("UpdateEmployeesService", () => {
  let service: UpdateEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest
        .fn()
        .mockResolvedValue({ ...employeeMock, name: "Novo Funcionario" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UpdateEmployeesService, useValue: serviceMock }],
    }).compile();

    service = module.get<UpdateEmployeesService>(UpdateEmployeesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update an employee", async () => {
    const result = await service.execute("user-id-test", {
      idEmployees: "mock-employee-id",
      name: "Novo Funcionario",
    });

    expect(result.name).toBe("Novo Funcionario");
  });

  it("should throw error if employee not found", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Funcionario nao encontrado."),
    );

    await expect(
      service.execute("user-id-test", { idEmployees: "not-exist" }),
    ).rejects.toThrow("Funcionario nao encontrado.");
  });
});
