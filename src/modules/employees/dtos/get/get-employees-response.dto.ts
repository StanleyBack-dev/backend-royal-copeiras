import { ObjectType, Field } from "@nestjs/graphql";
import { IEmployee } from "../../interface/employee.interface";

@ObjectType()
export class GetEmployeesResponseDto implements IEmployee {
  static fromEntity(
    entity: import("../../entities/employees.entity").EmployeesEntity,
  ): GetEmployeesResponseDto {
    const dto = new GetEmployeesResponseDto();
    dto.idEmployees = entity.idEmployees;
    dto.name = entity.name;
    dto.document = entity.document;
    dto.email = entity.email;
    dto.phone = entity.phone;
    dto.position = entity.position;
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
  idEmployees!: string;

  @Field()
  name!: string;

  @Field()
  document!: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  position!: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
