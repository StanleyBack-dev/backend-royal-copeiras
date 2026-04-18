import { Test, TestingModule } from "@nestjs/testing";
import { CreateLeadsResolver } from "../../resolvers/create/create-leads.resolver";
import { CreateLeadsService } from "../../services/create/create-leads.service";

describe("CreateLeadsResolver", () => {
  let resolver: CreateLeadsResolver;
  let service: CreateLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateLeadsResolver,
        { provide: CreateLeadsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<CreateLeadsResolver>(CreateLeadsResolver);
    service = module.get<CreateLeadsService>(CreateLeadsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
