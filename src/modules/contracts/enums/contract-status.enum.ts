import { registerEnumType } from "@nestjs/graphql";

export enum ContractStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  PENDING_SIGNATURE = "pending_signature",
  SIGNED = "signed",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

registerEnumType(ContractStatus, {
  name: "ContractStatus",
});
