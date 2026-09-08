import { VerifyPublicIntakeCodeService } from "../services/verify/verify-public-intake-code.service";
import { PublicIntakeCodesService } from "../services/public-intake-codes.service";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";

describe("VerifyPublicIntakeCodeService", () => {
  it("rejects a code that isn't active", async () => {
    const codesService: Partial<PublicIntakeCodesService> = {
      findActiveByCode: jest.fn().mockResolvedValue(null),
      markVerified: jest.fn(),
    };

    const service = new VerifyPublicIntakeCodeService(codesService as never);

    await expect(service.execute("000000")).rejects.toThrow(
      APP_ERRORS.publicIntake.codeInvalidOrExpired.message as string,
    );
    expect(codesService.markVerified).not.toHaveBeenCalled();
  });

  it("marks an active code as verified", async () => {
    const activeCode = { idPublicIntakeCodes: "code-1" };
    const verified = { formToken: "token-1", expiresAt: new Date() };

    const codesService: Partial<PublicIntakeCodesService> = {
      findActiveByCode: jest.fn().mockResolvedValue(activeCode),
      markVerified: jest.fn().mockResolvedValue(verified),
    };

    const service = new VerifyPublicIntakeCodeService(codesService as never);

    const result = await service.execute("123456");

    expect(codesService.markVerified).toHaveBeenCalledWith(activeCode);
    expect(result).toBe(verified);
  });
});
