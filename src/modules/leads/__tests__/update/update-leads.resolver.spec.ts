import { Test, TestingModule } from "@nestjs/testing";
import { UpdateLeadsResolver } from "../../resolvers/update/update-leads.resolver";
import { UpdateLeadsService } from "../../services/update/update-leads.service";

describe("UpdateLeadsResolver", () => {
  let resolver: UpdateLeadsResolver;
  let service: UpdateLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateLeadsResolver,
        { provide: UpdateLeadsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<UpdateLeadsResolver>(UpdateLeadsResolver);
    service = module.get<UpdateLeadsService>(UpdateLeadsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
