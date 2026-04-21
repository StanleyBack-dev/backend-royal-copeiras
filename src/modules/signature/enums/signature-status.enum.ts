import { registerEnumType } from "@nestjs/graphql";

export enum SignatureStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  SIGNED = "SIGNED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  UNKNOWN = "UNKNOWN",
}

registerEnumType(SignatureStatus, {
  name: "SignatureStatus",
});
