import { CustomersEntity } from "../../entities/customers.entity";

describe("CustomersEntity", () => {
  it("should be defined", () => {
    expect(new CustomersEntity()).toBeDefined();
  });
});
