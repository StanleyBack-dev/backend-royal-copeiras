import { Test, TestingModule } from "@nestjs/testing";
import { UpdateUserResolver } from "../../resolvers/update/update-users.resolver";
import { UpdateUserService } from "../../services/update/update-user.service";

describe("UpdateUserResolver", () => {
  let resolver: UpdateUserResolver;
  let service: UpdateUserService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserResolver,
        { provide: UpdateUserService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<UpdateUserResolver>(UpdateUserResolver);
    service = module.get<UpdateUserService>(UpdateUserService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
