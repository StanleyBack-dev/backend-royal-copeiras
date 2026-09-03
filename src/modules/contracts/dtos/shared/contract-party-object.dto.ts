import { Field, ObjectType } from "@nestjs/graphql";
import { ContractPartySnapshot } from "../../interfaces/contract-party.interface";

/**
 * CONTRATADA block exposed alongside the contract (source: frozen snapshot).
 */
@ObjectType()
export class ContractPartyObjectType implements ContractPartySnapshot {
  static fromSnapshot(
    snapshot?: ContractPartySnapshot | null,
  ): ContractPartyObjectType | undefined {
    if (!snapshot || Object.keys(snapshot).length === 0) {
      return undefined;
    }

    const dto = new ContractPartyObjectType();
    dto.legalName = snapshot.legalName;
    dto.tradeName = snapshot.tradeName;
    dto.document = snapshot.document;
    dto.stateRegistration = snapshot.stateRegistration;
    dto.municipalRegistration = snapshot.municipalRegistration;
    dto.email = snapshot.email;
    dto.phone = snapshot.phone;
    dto.address = snapshot.address;
    dto.addressCity = snapshot.addressCity;
    dto.addressState = snapshot.addressState;
    dto.addressZipCode = snapshot.addressZipCode;
    dto.representativeName = snapshot.representativeName;
    dto.representativeRole = snapshot.representativeRole;
    dto.representativeDocument = snapshot.representativeDocument;
    dto.pixKey = snapshot.pixKey;
    dto.pixKeyType = snapshot.pixKeyType;
    dto.issueCity = snapshot.issueCity;
    return dto;
  }

  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  tradeName?: string;

  @Field({ nullable: true })
  document?: string;

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
}
