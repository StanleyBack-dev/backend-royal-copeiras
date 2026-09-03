import { Repository } from "typeorm";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { COMPANY_PROFILE_DEFAULTS } from "../../constants/company-profile-defaults.constant";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { GetCompanyProfileService } from "../../services/get/get-company-profile.service";

function buildEntity(
  overrides: Partial<CompanyProfileEntity> = {},
): CompanyProfileEntity {
  const entity = new CompanyProfileEntity();
  entity.idCompanyProfile = "profile-1";
  entity.legalName = "Estevam Barros Rodrigues";
  entity.tradeName = "Royal Copeiras";
  entity.document = "64.062.038/0001-71";
  entity.createdAt = new Date("2026-09-03T12:00:00Z");
  entity.updatedAt = new Date("2026-09-03T12:00:00Z");
  return Object.assign(entity, overrides);
}

describe("GetCompanyProfileService", () => {
  let repository: jest.Mocked<Repository<CompanyProfileEntity>>;
  let authorizationService: jest.Mocked<AuthorizationService>;
  let service: GetCompanyProfileService;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<CompanyProfileEntity>>;

    authorizationService = {
      assertPermissionForUserId: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuthorizationService>;

    service = new GetCompanyProfileService(repository, authorizationService);
  });

  describe("resolveEntity", () => {
    it("returns the existing record without creating a new one", async () => {
      const existing = buildEntity();
      repository.find.mockResolvedValue([existing]);

      const result = await service.resolveEntity();

      expect(result).toBe(existing);
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });

    it("seeds the record from the Royal Copeiras defaults when none exists", async () => {
      const seeded = buildEntity();
      repository.find.mockResolvedValue([]);
      repository.create.mockReturnValue(seeded);
      repository.save.mockResolvedValue(seeded);

      const result = await service.resolveEntity();

      expect(repository.create).toHaveBeenCalledWith({
        ...COMPANY_PROFILE_DEFAULTS,
      });
      expect(repository.save).toHaveBeenCalledWith(seeded);
      expect(result).toBe(seeded);
    });
  });

  describe("execute", () => {
    it("checks the READ_COMPANY_PROFILE permission before returning data", async () => {
      repository.find.mockResolvedValue([buildEntity()]);

      await service.execute("user-1");

      expect(
        authorizationService.assertPermissionForUserId,
      ).toHaveBeenCalledWith("user-1", AuthPermission.READ_COMPANY_PROFILE);
    });

    it("propagates a denied permission and does not touch the repository", async () => {
      authorizationService.assertPermissionForUserId.mockRejectedValue(
        new Error("forbidden"),
      );

      await expect(service.execute("user-1")).rejects.toThrow("forbidden");
      expect(repository.find).not.toHaveBeenCalled();
    });
  });
});
