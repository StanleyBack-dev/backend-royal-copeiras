import { ObjectType, Field } from "@nestjs/graphql";
import { UserGroup } from "../../enums/user-group.enum";

@ObjectType()
export class GetUserResponseDto {
  static fromEntity(entity: import("../../entities/user.entity").UserEntity) {
    const dto = new GetUserResponseDto();
    dto.idUsers = entity.idUsers;
    dto.name = entity.name;
    dto.email = entity.email;
    dto.urlAvatar = entity.urlAvatar;
    dto.status = entity.status;
    dto.group = entity.group;
    dto.inactivatedAt = entity.inactivatedAt;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  @Field()
  idUsers: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  urlAvatar?: string;

  @Field()
  status: boolean;

  @Field(() => UserGroup)
  group: UserGroup;

  @Field({ nullable: true })
  inactivatedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
