import { Test, TestingModule } from "@nestjs/testing";
import { GetLeadsResolver } from "../../resolvers/get/get-leads.resolver";
import { GetLeadsService } from "../../services/get/get-leads.service";

describe("GetLeadsResolver", () => {
  let resolver: GetLeadsResolver;
  let service: GetLeadsService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLeadsResolver,
        { provide: GetLeadsService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<GetLeadsResolver>(GetLeadsResolver);
    service = module.get<GetLeadsService>(GetLeadsService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
