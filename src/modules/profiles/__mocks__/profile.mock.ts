import { ProfileEntity } from "../entities/profile.entity";
import { UserEntity } from "../../users/entities/user.entity";

export const profileMock: ProfileEntity = {
  idProfiles: "mock-profile-id",
  idUsers: "mock-user-id",
  user: { idUsers: "mock-user-id" } as UserEntity, // mock if needed
  phone: "11999999999",
  birthDate: "1990-01-01",
  sex: "male",
  heightM: 1.75,
  activityLevel: "active",
  createdAt: new Date("2024-04-12T00:00:00Z"),
  updatedAt: new Date("2024-04-12T00:00:00Z"),
};
