import { Test, TestingModule } from "@nestjs/testing";
import { CreateEmployeesService } from "../../services/create/create-employees.service";
import { CreateEmployeesResolver } from "../../resolvers/create/create-employees.resolver";

describe("CreateEmployeesResolver", () => {
  let resolver: CreateEmployeesResolver;
  let service: CreateEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEmployeesResolver,
        { provide: CreateEmployeesService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<CreateEmployeesResolver>(CreateEmployeesResolver);
    service = module.get<CreateEmployeesService>(CreateEmployeesService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
