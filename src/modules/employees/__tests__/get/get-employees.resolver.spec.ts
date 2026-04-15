import { Test, TestingModule } from "@nestjs/testing";
import { GetEmployeesService } from "../../services/get/get-employees.service";
import { GetEmployeesResolver } from "../../resolvers/get/get-employees.resolver";

describe("GetEmployeesResolver", () => {
  let resolver: GetEmployeesResolver;
  let service: GetEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEmployeesResolver,
        { provide: GetEmployeesService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<GetEmployeesResolver>(GetEmployeesResolver);
    service = module.get<GetEmployeesService>(GetEmployeesService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
