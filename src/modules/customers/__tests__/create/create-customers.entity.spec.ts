import { CustomersEntity } from "../../entities/customers.entity";

describe("CreateCustomersEntity", () => {
  it("should be defined", () => {
    expect(new CustomersEntity()).toBeDefined();
  });
});
