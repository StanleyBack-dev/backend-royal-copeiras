import { SessionEntity } from "../../entities/session.entity";

describe("SessionEntity", () => {
  it("should be defined", () => {
    expect(new SessionEntity()).toBeDefined();
  });
});
