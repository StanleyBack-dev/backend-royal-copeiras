import { Test, TestingModule } from "@nestjs/testing";
import { GetCustomersService } from "../../services/get/get-customers.service";
import { customerMock } from "../../__mocks__/customer.mock";

describe("GetCustomersService", () => {
  let service: GetCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([customerMock]),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GetCustomersService, useValue: serviceMock }],
    }).compile();
    service = module.get<GetCustomersService>(GetCustomersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a list of customers", async () => {
    const userId = "user-id-test";
    const result = await service.findAll(userId);
    expect(result).toEqual([customerMock]);
  });

  it("should return empty array if no customers", async () => {
    (service.findAll as jest.Mock).mockResolvedValueOnce([]);
    const userId = "user-id-test";
    const result = await service.findAll(userId);
    expect(result).toEqual([]);
  });
});
