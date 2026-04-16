import { HttpStatus } from "@nestjs/common";
import { PermissionParams } from "./catalog-params.type";

export const authorizationErrors = {
  authenticatedUserNotFound: {
    code: "AUTHZ_AUTHENTICATED_USER_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Usuário autenticado não encontrado.",
  },
  missingPermission: {
    code: "AUTHZ_MISSING_PERMISSION",
    status: HttpStatus.FORBIDDEN,
    message: ({ group, permission }: PermissionParams) =>
      `O grupo ${group} não possui a permissão ${permission}.`,
  },
} as const;
