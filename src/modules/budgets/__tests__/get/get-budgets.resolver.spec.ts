import { Test, TestingModule } from "@nestjs/testing";
import { GetBudgetsResolver } from "../../resolvers/get/get-budgets.resolver";
import { GetBudgetsService } from "../../services/get/get-budgets.service";

describe("GetBudgetsResolver", () => {
  let resolver: GetBudgetsResolver;
  let service: GetBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBudgetsResolver,
        { provide: GetBudgetsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<GetBudgetsResolver>(GetBudgetsResolver);
    service = module.get<GetBudgetsService>(GetBudgetsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
