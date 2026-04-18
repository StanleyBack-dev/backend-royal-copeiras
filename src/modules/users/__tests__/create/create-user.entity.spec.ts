import { UserEntity } from "../../entities/user.entity";

describe("CreateUserEntity", () => {
  it("should be defined", () => {
    expect(new UserEntity()).toBeDefined();
  });
});
