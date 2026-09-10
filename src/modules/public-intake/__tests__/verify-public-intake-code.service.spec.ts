import { VerifyPublicIntakeCodeService } from "../services/verify/verify-public-intake-code.service";
import { PublicIntakeCodesService } from "../services/public-intake-codes.service";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";

function makeSuppliesRepo(supplies: unknown[] = []) {
  return { find: jest.fn().mockResolvedValue(supplies) };
}

describe("VerifyPublicIntakeCodeService", () => {
  it("rejects a code that isn't active", async () => {
    const codesService: Partial<PublicIntakeCodesService> = {
      findActiveByCode: jest.fn().mockResolvedValue(null),
      markVerified: jest.fn(),
    };

    const service = new VerifyPublicIntakeCodeService(
      codesService as never,
      makeSuppliesRepo() as never,
    );

    await expect(service.execute("000000")).rejects.toThrow(
      APP_ERRORS.publicIntake.codeInvalidOrExpired.message as string,
    );
    expect(codesService.markVerified).not.toHaveBeenCalled();
  });

  it("marks an active code as verified and returns the operator's active supplies", async () => {
    const activeCode = { idPublicIntakeCodes: "code-1", idUsers: "user-1" };
    const verified = { formToken: "token-1", expiresAt: "2026-09-11T00:00:00" };
    const suppliesRepo = makeSuppliesRepo([
      {
        idSupplies: "s1",
        name: "Papel higiênico",
        defaultUnit: "rolo",
        isActive: true,
      },
    ]);

    const codesService: Partial<PublicIntakeCodesService> = {
      findActiveByCode: jest.fn().mockResolvedValue(activeCode),
      markVerified: jest.fn().mockResolvedValue(verified),
    };

    const service = new VerifyPublicIntakeCodeService(
      codesService as never,
      suppliesRepo as never,
    );

    const result = await service.execute("123456");

    expect(codesService.markVerified).toHaveBeenCalledWith(activeCode);
    expect(suppliesRepo.find).toHaveBeenCalledWith({
      where: { idUsers: "user-1", isActive: true },
      order: { name: "ASC" },
    });
    expect(result).toEqual({
      ...verified,
      supplies: [
        { idSupplies: "s1", name: "Papel higiênico", defaultUnit: "rolo" },
      ],
    });
  });
});
