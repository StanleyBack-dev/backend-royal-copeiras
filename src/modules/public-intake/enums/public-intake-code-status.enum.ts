import { registerEnumType } from "@nestjs/graphql";

export enum PublicIntakeCodeStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  SUBMITTED = "submitted",
  EXPIRED = "expired",
  INVALIDATED = "invalidated",
}

registerEnumType(PublicIntakeCodeStatus, {
  name: "PublicIntakeCodeStatus",
});
