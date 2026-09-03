import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { UpdateCompanyProfileInputDto } from "../../dtos/update/update-company-profile-input.dto";

const REQUIRED_FIELDS: Array<keyof UpdateCompanyProfileInputDto> = [
  "legalName",
  "tradeName",
  "document",
];

const OPTIONAL_TEXT_FIELDS: Array<keyof UpdateCompanyProfileInputDto> = [
  "stateRegistration",
  "municipalRegistration",
  "email",
  "phone",
  "address",
  "addressCity",
  "addressState",
  "addressZipCode",
  "representativeName",
  "representativeRole",
  "representativeDocument",
  "pixKey",
  "pixKeyType",
  "issueCity",
  "website",
];

export class UpdateCompanyProfileValidator {
  static async validateAndUpdate(
    input: UpdateCompanyProfileInputDto,
    record: CompanyProfileEntity,
    companyProfileRepo: Repository<CompanyProfileEntity>,
  ): Promise<CompanyProfileEntity> {
    const hasUpdateData = Object.entries(input).some(
      ([, value]) => value !== undefined,
    );

    if (!hasUpdateData) {
      throw AppException.from(
        APP_ERRORS.companyProfile.noUpdateData,
        undefined,
      );
    }

    for (const field of REQUIRED_FIELDS) {
      const value = input[field];
      if (value !== undefined && String(value).trim().length === 0) {
        throw AppException.from(
          APP_ERRORS.companyProfile.requiredFieldEmpty,
          undefined,
        );
      }
      if (typeof value === "string") {
        record[field] = value.trim() as never;
      }
    }

    for (const field of OPTIONAL_TEXT_FIELDS) {
      const value = input[field];
      if (value === undefined) {
        continue;
      }
      const trimmed = String(value).trim();
      record[field] = (trimmed.length > 0 ? trimmed : undefined) as never;
    }

    return companyProfileRepo.save(record);
  }
}
