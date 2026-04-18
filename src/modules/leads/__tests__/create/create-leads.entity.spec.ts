import { LeadsEntity } from "../../entities/leads.entity";

describe("CreateLeadsEntity", () => {
  it("should be defined", () => {
    expect(new LeadsEntity()).toBeDefined();
  });
});
