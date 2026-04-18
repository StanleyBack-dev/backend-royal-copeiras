import { Test, TestingModule } from "@nestjs/testing";
import { CreateBudgetsResolver } from "../../resolvers/create/create-budgets.resolver";
import { CreateBudgetsService } from "../../services/create/create-budgets.service";

describe("CreateBudgetsResolver", () => {
  let resolver: CreateBudgetsResolver;
  let service: CreateBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBudgetsResolver,
        { provide: CreateBudgetsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<CreateBudgetsResolver>(CreateBudgetsResolver);
    service = module.get<CreateBudgetsService>(CreateBudgetsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
