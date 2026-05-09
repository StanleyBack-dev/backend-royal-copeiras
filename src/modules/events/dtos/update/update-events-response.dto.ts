import { Field, Int, ObjectType } from "@nestjs/graphql";
import { EventEntity } from "../../entities/event.entity";
import { formatLocalDateTime } from "../../../../common/responses/format-local-datetime.util";
import { EventStatus } from "../../enums/event-status.enum";

@ObjectType()
export class UpdateEventsResponseDto {
  static fromEntity(entity: EventEntity): UpdateEventsResponseDto {
    const dto = new UpdateEventsResponseDto();
    dto.idEvents = entity.idEvents;
    dto.status = entity.status;
    dto.overtimeMinutes = Number(entity.overtimeMinutes ?? 0);
    dto.updatedAt =
      formatLocalDateTime(entity.updatedAt) || String(entity.updatedAt);
    return dto;
  }

  @Field()
  idEvents!: string;

  @Field(() => EventStatus)
  status!: EventStatus;

  @Field(() => Int)
  overtimeMinutes!: number;

  @Field()
  updatedAt!: string;
}
