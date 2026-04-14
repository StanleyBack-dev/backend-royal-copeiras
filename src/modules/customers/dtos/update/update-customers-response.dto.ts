import { ObjectType, Field } from "@nestjs/graphql";
import { ICustomer } from "../../interface/customer.interface";

@ObjectType()
export class UpdateCustomersResponseDto implements ICustomer {
  static fromEntity(
    entity: import("../../entities/customers.entity").CustomersEntity,
  ): UpdateCustomersResponseDto {
    const dto = new UpdateCustomersResponseDto();
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
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    dto.updatedAt =
      entity.updatedAt instanceof Date
        ? entity.updatedAt.toISOString()
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
