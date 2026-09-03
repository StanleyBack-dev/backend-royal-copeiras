import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { UpdateCompanyProfileInputDto } from "../../dtos/update/update-company-profile-input.dto";
import { UpdateCompanyProfileValidator } from "../../validators/update/update-company-profile.validator";

function buildRecord(): CompanyProfileEntity {
  const record = new CompanyProfileEntity();
  record.idCompanyProfile = "profile-1";
  record.legalName = "Estevam Barros Rodrigues";
  record.tradeName = "Royal Copeiras";
  record.document = "64.062.038/0001-71";
  record.phone = "62999999999";
  return record;
}

function buildRepo(): Repository<CompanyProfileEntity> {
  return {
    save: jest.fn(async (entity: CompanyProfileEntity) => entity),
  } as unknown as Repository<CompanyProfileEntity>;
}

describe("UpdateCompanyProfileValidator", () => {
  it("throws when no field was provided", async () => {
    await expect(
      UpdateCompanyProfileValidator.validateAndUpdate(
        {} as UpdateCompanyProfileInputDto,
        buildRecord(),
        buildRepo(),
      ),
    ).rejects.toThrow(
      AppException.from(APP_ERRORS.companyProfile.noUpdateData, undefined),
    );
  });

  it("rejects blanking a required field", async () => {
    await expect(
      UpdateCompanyProfileValidator.validateAndUpdate(
        { legalName: "   " } as UpdateCompanyProfileInputDto,
        buildRecord(),
        buildRepo(),
      ),
    ).rejects.toThrow(
      AppException.from(
        APP_ERRORS.companyProfile.requiredFieldEmpty,
        undefined,
      ),
    );
  });

  it("trims required fields before saving", async () => {
    const record = buildRecord();
    const repo = buildRepo();

    const result = await UpdateCompanyProfileValidator.validateAndUpdate(
      {
        tradeName: "  Royal Copeiras Eventos  ",
      } as UpdateCompanyProfileInputDto,
      record,
      repo,
    );

    expect(result.tradeName).toBe("Royal Copeiras Eventos");
    expect(repo.save).toHaveBeenCalledWith(record);
  });

  it("clears an optional field when an empty string is sent", async () => {
    const record = buildRecord();

    const result = await UpdateCompanyProfileValidator.validateAndUpdate(
      { phone: "" } as UpdateCompanyProfileInputDto,
      record,
      buildRepo(),
    );

    expect(result.phone).toBeUndefined();
  });

  it("trims and keeps an optional field with content", async () => {
    const record = buildRecord();

    const result = await UpdateCompanyProfileValidator.validateAndUpdate(
      { issueCity: "  Goiânia  " } as UpdateCompanyProfileInputDto,
      record,
      buildRepo(),
    );

    expect(result.issueCity).toBe("Goiânia");
  });
});
