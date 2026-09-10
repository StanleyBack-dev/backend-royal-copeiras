import { ConfigService } from "@nestjs/config";
import { PublicIntakeCodesService } from "../services/public-intake-codes.service";

function makeConfigService(): ConfigService {
  return {
    get: jest.fn((_key: string, defaultValue?: unknown) => defaultValue),
  } as unknown as ConfigService;
}

describe("PublicIntakeCodesService", () => {
  it("invalidates the user's previous open codes when issuing a new one", async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PublicIntakeCodesService(
      repo as never,
      makeConfigService(),
    );

    const before = Date.now();
    const issued = await service.issueCode("user-1");

    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ idUsers: "user-1" }),
      expect.objectContaining({ invalidatedAt: expect.any(Date) }),
    );
    expect(issued.code).toMatch(/^\d{6}$/);
    expect(repo.save).toHaveBeenCalled();

    // The saved entity carries a Date roughly one code-TTL in the future.
    const savedEntity = repo.create.mock.calls[0][0] as { expiresAt: Date };
    expect(savedEntity.expiresAt).toBeInstanceOf(Date);
    expect(savedEntity.expiresAt.getTime()).toBeGreaterThan(before);
  });

  it("marks a code verified and issues a form token with a future expiry", async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PublicIntakeCodesService(
      repo as never,
      makeConfigService(),
    );

    const before = Date.now();
    const result = await service.markVerified({
      idPublicIntakeCodes: "code-1",
    } as never);

    expect(result.formToken).toBeTruthy();
    expect(repo.update).toHaveBeenCalledWith(
      { idPublicIntakeCodes: "code-1" },
      expect.objectContaining({
        verifiedAt: expect.any(Date),
        formToken: result.formToken,
        formTokenExpiresAt: expect.any(Date),
      }),
    );

    const [, patch] = repo.update.mock.calls[0] as [
      unknown,
      { formTokenExpiresAt: Date },
    ];
    expect(patch.formTokenExpiresAt.getTime()).toBeGreaterThan(before);
  });

  it("records the resulting lead/budget when consuming a code", async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PublicIntakeCodesService(
      repo as never,
      makeConfigService(),
    );

    await service.consume({ idPublicIntakeCodes: "code-1" } as never, {
      resultingLeadId: "lead-1",
      resultingBudgetId: "budget-1",
    });

    expect(repo.update).toHaveBeenCalledWith(
      { idPublicIntakeCodes: "code-1" },
      expect.objectContaining({
        consumedAt: expect.any(Date),
        resultingLeadId: "lead-1",
        resultingBudgetId: "budget-1",
      }),
    );
  });
});
