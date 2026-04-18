import { registerEnumType } from "@nestjs/graphql";

export enum LeadStatus {
  NEW = "new",
  QUALIFIED = "qualified",
  WON = "won",
  LOST = "lost",
}

registerEnumType(LeadStatus, {
  name: "LeadStatus",
});
