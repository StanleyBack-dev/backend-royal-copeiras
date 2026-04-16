import { UserEntity } from "../entities/user.entity";
import { UserGroup } from "../enums/user-group.enum";

export const userMock: UserEntity = {
  idUsers: "mock-user-id",
  name: "Mock User",
  email: "mock@example.com",
  urlAvatar: "http://mock.com/avatar.png",
  status: true,
  group: UserGroup.USER,
  inactivatedAt: undefined,
  ipAddress: "127.0.0.1",
  userAgent: "jest",
  createdAt: new Date("2024-04-12T00:00:00Z"),
  updatedAt: new Date("2024-04-12T00:00:00Z"),
};
