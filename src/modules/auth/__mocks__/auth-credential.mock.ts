import { AuthCredentialEntity } from "../entities/auth-credential.entity";
import { userMock } from "../../users/__mocks__/user.mock";

export const authCredentialMock: AuthCredentialEntity = {
  idAuthCredentials: "mock-auth-credential-id",
  idUsers: userMock.idUsers,
  user: userMock,
  username: "mock.user",
  passwordHash: "salt:hash",
  mustChangePassword: true,
  temporaryPasswordCreatedAt: new Date("2024-04-12T00:00:00Z"),
  passwordChangedAt: undefined,
  lastLoginAt: undefined,
  failedLoginAttempts: 0,
  lockUntil: undefined,
  createdAt: new Date("2024-04-12T00:00:00Z"),
  updatedAt: new Date("2024-04-12T00:00:00Z"),
};
