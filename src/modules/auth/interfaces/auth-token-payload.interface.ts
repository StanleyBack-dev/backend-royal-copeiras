import { UserGroup } from "../../users/enums/user-group.enum";

export interface AuthTokenPayload {
  sub: string;
  uid: string;
  username: string;
  group: UserGroup;
  type: "access" | "refresh";
}

export interface AuthenticatedUser {
  idUsers: string;
  username: string;
  group: UserGroup;
}
