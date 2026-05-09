import { registerEnumType } from "@nestjs/graphql";

export enum EmployeeGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

registerEnumType(EmployeeGender, {
  name: "EmployeeGender",
});
