import { registerEnumType } from "@nestjs/graphql";

export enum EventExtraExpenseCategory {
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  FUEL = "FUEL",
  PARKING = "PARKING",
  TOLL = "TOLL",
  SUPPLIES = "SUPPLIES",
  OTHER = "OTHER",
}

registerEnumType(EventExtraExpenseCategory, {
  name: "EventExtraExpenseCategory",
});
