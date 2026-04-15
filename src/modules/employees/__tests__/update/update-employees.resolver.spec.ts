import { Test, TestingModule } from "@nestjs/testing";
import { UpdateEmployeesService } from "../../services/update/update-employees.service";
import { UpdateEmployeesResolver } from "../../resolvers/update/update-employees.resolver";

describe("UpdateEmployeesResolver", () => {
  let resolver: UpdateEmployeesResolver;
  let service: UpdateEmployeesService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEmployeesResolver,
        { provide: UpdateEmployeesService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<UpdateEmployeesResolver>(UpdateEmployeesResolver);
    service = module.get<UpdateEmployeesService>(UpdateEmployeesService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
