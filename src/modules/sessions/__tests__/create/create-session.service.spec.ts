import { Test, TestingModule } from "@nestjs/testing";
import { CreateSessionService } from "../../services/create/create-session.service";
import { sessionMock } from "../../__mocks__/session.mock";

describe("CreateSessionService", () => {
  let service: CreateSessionService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(sessionMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CreateSessionService, useValue: serviceMock }],
    }).compile();

    service = module.get<CreateSessionService>(CreateSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a session", async () => {
    const result = await service.execute({
      idUsers: "mock-user-id",
      refreshToken: "mock-refresh-token",
    });

    expect(result).toEqual(sessionMock);
  });
});
