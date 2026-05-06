import { ObjectType, Field } from "@nestjs/graphql";
import { ICustomer } from "../../interface/customer.interface";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";

@ObjectType()
export class GetCustomersResponseDto implements ICustomer {
  static fromEntity(
    entity: import("../../entities/customers.entity").CustomersEntity,
  ): GetCustomersResponseDto {
    const dto = new GetCustomersResponseDto();
    dto.idCustomers = entity.idCustomers;
    dto.name = entity.name;
    dto.document = entity.document;
    dto.type = entity.type;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.address = entity.address;
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
  idCustomers!: string;

  @Field()
  name!: string;

  @Field()
  document!: string;

  @Field()
  type!: "individual" | "company";

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
