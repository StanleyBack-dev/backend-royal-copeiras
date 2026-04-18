import { Test, TestingModule } from "@nestjs/testing";
import { RevokeSessionService } from "../../services/revoke/revoke-session.service";

describe("RevokeSessionService", () => {
  let service: RevokeSessionService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: RevokeSessionService, useValue: serviceMock }],
    }).compile();

    service = module.get<RevokeSessionService>(RevokeSessionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should revoke a session", async () => {
    await expect(
      service.execute("mock-refresh-token"),
    ).resolves.toBeUndefined();
  });
});
