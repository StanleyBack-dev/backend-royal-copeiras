import { LeadsEntity } from "../../entities/leads.entity";

describe("LeadsEntity", () => {
  it("should be defined", () => {
    expect(new LeadsEntity()).toBeDefined();
  });
});
