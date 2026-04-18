import { registerEnumType } from "@nestjs/graphql";

export enum BudgetStatus {
  DRAFT = "draft",
  SENT = "sent",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
  CANCELED = "canceled",
}

registerEnumType(BudgetStatus, {
  name: "BudgetStatus",
});
