import { Field, ObjectType } from "@nestjs/graphql";
import { ICompanyProfile } from "../../interface/company-profile.interface";
import { CompanyProfileEntity } from "../../entities/company-profile.entity";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class UpdateCompanyProfileResponseDto implements ICompanyProfile {
  static fromEntity(
    entity: CompanyProfileEntity,
  ): UpdateCompanyProfileResponseDto {
    const dto = new UpdateCompanyProfileResponseDto();
    dto.idCompanyProfile = entity.idCompanyProfile;
    dto.legalName = entity.legalName;
    dto.tradeName = entity.tradeName;
    dto.document = entity.document;
    dto.stateRegistration = entity.stateRegistration;
    dto.municipalRegistration = entity.municipalRegistration;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.address = entity.address;
    dto.addressCity = entity.addressCity;
    dto.addressState = entity.addressState;
    dto.addressZipCode = entity.addressZipCode;
    dto.representativeName = entity.representativeName;
    dto.representativeRole = entity.representativeRole;
    dto.representativeDocument = entity.representativeDocument;
    dto.pixKey = entity.pixKey;
    dto.pixKeyType = entity.pixKeyType;
    dto.issueCity = entity.issueCity;
    dto.website = entity.website;
    dto.createdAt =
      entity.createdAt instanceof Date
        ? formatLocalDateTime(entity.createdAt) || String(entity.createdAt)
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt)
        : String(entity.updatedAt);
    return dto;
  }

  @Field()
  idCompanyProfile!: string;

  @Field()
  legalName!: string;

  @Field()
  tradeName!: string;

  @Field()
  document!: string;

  @Field({ nullable: true })
  stateRegistration?: string;

  @Field({ nullable: true })
  municipalRegistration?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  addressCity?: string;

  @Field({ nullable: true })
  addressState?: string;

  @Field({ nullable: true })
  addressZipCode?: string;

  @Field({ nullable: true })
  representativeName?: string;

  @Field({ nullable: true })
  representativeRole?: string;

  @Field({ nullable: true })
  representativeDocument?: string;

  @Field({ nullable: true })
  pixKey?: string;

  @Field({ nullable: true })
  pixKeyType?: string;

  @Field({ nullable: true })
  issueCity?: string;

  @Field({ nullable: true })
  website?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
