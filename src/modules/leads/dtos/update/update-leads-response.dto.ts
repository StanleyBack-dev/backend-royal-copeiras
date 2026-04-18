import { Field, ObjectType } from "@nestjs/graphql";
import { ILead } from "../../interface/lead.interface";
import { LeadStatus } from "../../enums/lead-status.enum";

@ObjectType()
export class UpdateLeadsResponseDto implements ILead {
  static fromEntity(
    entity: import("../../entities/leads.entity").LeadsEntity,
  ): UpdateLeadsResponseDto {
    const dto = new UpdateLeadsResponseDto();
    dto.idLeads = entity.idLeads;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.document = entity.document;
    dto.source = entity.source;
    dto.notes = entity.notes;
    dto.status = entity.status;
    dto.isActive = entity.isActive;
    dto.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? entity.updatedAt.toISOString()
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
  source?: string;

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
