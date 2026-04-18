import { Test, TestingModule } from "@nestjs/testing";
import { GetUsersResolver } from "../../resolvers/get/get-users.resolver";
import { GetUsersService } from "../../services/get/get-users.service";

describe("GetUsersResolver", () => {
  let resolver: GetUsersResolver;
  let service: GetUsersService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByIdOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersResolver,
        { provide: GetUsersService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<GetUsersResolver>(GetUsersResolver);
    service = module.get<GetUsersService>(GetUsersService);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});
