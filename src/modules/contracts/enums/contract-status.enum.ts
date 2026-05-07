import { registerEnumType } from "@nestjs/graphql";

export enum ContractStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  PENDING_SIGNATURE = "pending_signature",
  SIGNED = "signed",
  CLOSED_WITHOUT_SIGNATURE = "closed_without_signature",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

registerEnumType(ContractStatus, {
  name: "ContractStatus",
});
