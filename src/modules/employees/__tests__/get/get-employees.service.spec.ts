import { Test, TestingModule } from "@nestjs/testing";
import { GetEmployeesService } from "../../services/get/get-employees.service";
import { employeeMock } from "../../__mocks__/employee.mock";

describe("GetEmployeesService", () => {
  let service: GetEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([employeeMock]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GetEmployeesService, useValue: serviceMock }],
    }).compile();

    service = module.get<GetEmployeesService>(GetEmployeesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a list of employees", async () => {
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([employeeMock]);
  });

  it("should return empty array if no employees", async () => {
    (service.findAll as jest.Mock).mockResolvedValueOnce([]);
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([]);
  });
});
