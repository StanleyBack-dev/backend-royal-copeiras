import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserResolver } from "../../resolvers/create/create-user.resolver";
import { CreateUserService } from "../../services/create/create-user.service";

describe("CreateUserResolver", () => {
  let resolver: CreateUserResolver;
  let service: CreateUserService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserResolver,
        { provide: CreateUserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<CreateUserResolver>(CreateUserResolver);
    service = module.get<CreateUserService>(CreateUserService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
