import { registerEnumType } from "@nestjs/graphql";

export enum BudgetStatus {
  DRAFT = "draft",
  GENERATED = "generated",
  SENT = "sent",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

registerEnumType(BudgetStatus, {
  name: "BudgetStatus",
});
