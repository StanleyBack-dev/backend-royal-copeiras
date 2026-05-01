import { registerEnumType } from "@nestjs/graphql";

export enum EventStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

registerEnumType(EventStatus, {
  name: "EventStatus",
});
