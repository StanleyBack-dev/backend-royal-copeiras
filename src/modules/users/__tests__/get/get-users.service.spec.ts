import { Test, TestingModule } from "@nestjs/testing";
import { GetUsersService } from "../../services/get/get-users.service";
import { userMock } from "../../__mocks__/user.mock";

describe("GetUsersService", () => {
  let service: GetUsersService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([userMock]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GetUsersService, useValue: serviceMock }],
    }).compile();

    service = module.get<GetUsersService>(GetUsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a list of users", async () => {
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([userMock]);
  });

  it("should return empty array if no users", async () => {
    (service.findAll as jest.Mock).mockResolvedValueOnce([]);
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([]);
  });
});
