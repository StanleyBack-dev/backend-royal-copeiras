import { ConfigService } from "@nestjs/config";
import { toDbLocalTimestampString } from "../../../common/utils/to-db-local-timestamp.util";
import { PublicIntakeCodesService } from "../services/public-intake-codes.service";

function nowAsDbLocalString(): string {
  return toDbLocalTimestampString(new Date());
}

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

    const issued = await service.issueCode("user-1");

    expect(repo.update).toHaveBeenCalledWith(
      expect.objectContaining({ idUsers: "user-1" }),
      expect.objectContaining({ invalidatedAt: expect.any(String) }),
    );
    expect(issued.code).toMatch(/^\d{6}$/);
    expect(issued.expiresAt > nowAsDbLocalString()).toBe(true);
    expect(repo.save).toHaveBeenCalled();
  });

  it("marks a code verified and issues a form token", async () => {
    const repo = {
      update: jest.fn().mockResolvedValue(undefined),
    };

    const service = new PublicIntakeCodesService(
      repo as never,
      makeConfigService(),
    );

    const codeEntity = {
      idPublicIntakeCodes: "code-1",
    } as never;

    const result = await service.markVerified(codeEntity);

    expect(result.formToken).toBeTruthy();
    expect(result.expiresAt > nowAsDbLocalString()).toBe(true);
    expect(repo.update).toHaveBeenCalledWith(
      { idPublicIntakeCodes: "code-1" },
      expect.objectContaining({
        verifiedAt: expect.any(String),
        formToken: result.formToken,
        formTokenExpiresAt: expect.any(String),
      }),
    );
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
        consumedAt: expect.any(String),
        resultingLeadId: "lead-1",
        resultingBudgetId: "budget-1",
      }),
    );
  });
});
