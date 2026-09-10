import { Field, ObjectType } from "@nestjs/graphql";
import { ILead } from "../../interface/lead.interface";
import { LeadStatus } from "../../enums/lead-status.enum";
import { LeadSource, normalizeLeadSource } from "../../enums/lead-source.enum";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetLeadsResponseDto implements ILead {
  static fromEntity(
    entity: import("../../entities/leads.entity").LeadsEntity,
  ): GetLeadsResponseDto {
    const dto = new GetLeadsResponseDto();
    dto.idLeads = entity.idLeads;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.document = entity.document;
    dto.legalName = entity.legalName;
    dto.address = entity.address;
    dto.addressStreet = entity.addressStreet;
    dto.addressNumber = entity.addressNumber;
    dto.addressComplement = entity.addressComplement;
    dto.addressNeighborhood = entity.addressNeighborhood;
    dto.addressCity = entity.addressCity;
    dto.addressState = entity.addressState;
    dto.addressZipCode = entity.addressZipCode;
    dto.source = normalizeLeadSource(entity.source);
    dto.notes = entity.notes;
    dto.status = entity.status;
    dto.isActive = entity.isActive;
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
  idLeads!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  document?: string;

  @Field({ nullable: true })
  legalName?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  addressStreet?: string;

  @Field({ nullable: true })
  addressNumber?: string;

  @Field({ nullable: true })
  addressComplement?: string;

  @Field({ nullable: true })
  addressNeighborhood?: string;

  @Field({ nullable: true })
  addressCity?: string;

  @Field({ nullable: true })
  addressState?: string;

  @Field({ nullable: true })
  addressZipCode?: string;

  @Field(() => LeadSource, { nullable: true })
  source?: LeadSource;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => LeadStatus)
  status!: LeadStatus;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
