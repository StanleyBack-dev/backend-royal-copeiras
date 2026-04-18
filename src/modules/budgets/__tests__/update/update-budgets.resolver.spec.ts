import { Test, TestingModule } from "@nestjs/testing";
import { UpdateBudgetsResolver } from "../../resolvers/update/update-budgets.resolver";
import { UpdateBudgetsService } from "../../services/update/update-budgets.service";

describe("UpdateBudgetsResolver", () => {
  let resolver: UpdateBudgetsResolver;
  let service: UpdateBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBudgetsResolver,
        { provide: UpdateBudgetsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<UpdateBudgetsResolver>(UpdateBudgetsResolver);
    service = module.get<UpdateBudgetsService>(UpdateBudgetsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
