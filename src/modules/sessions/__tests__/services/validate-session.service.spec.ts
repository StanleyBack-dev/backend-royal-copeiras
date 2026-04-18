import { Test, TestingModule } from "@nestjs/testing";
import { ValidateSessionService } from "../../services/validate/validate-session.service";
import { sessionMock } from "../../__mocks__/session.mock";

describe("ValidateSessionService", () => {
  let service: ValidateSessionService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(sessionMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: ValidateSessionService, useValue: serviceMock }],
    }).compile();

    service = module.get<ValidateSessionService>(ValidateSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should validate active session", async () => {
    const result = await service.execute("mock-refresh-token", "mock-user-id");
    expect(result).toEqual(sessionMock);
  });

  it("should return null for invalid session", async () => {
    (service.execute as jest.Mock).mockResolvedValueOnce(null);

    const result = await service.execute("invalid-token", "mock-user-id");
    expect(result).toBeNull();
  });
});
