export const RESPONSE_MESSAGES = {
  auth: {
    logout: {
      code: "AUTH_LOGOUT_SUCCESS",
      message: "Logout realizado com sucesso.",
    },
    passwordChanged: {
      code: "AUTH_PASSWORD_CHANGED",
      message: "Senha alterada com sucesso.",
    },
    passwordRecoveryRequested: {
      code: "AUTH_PASSWORD_RECOVERY_REQUESTED",
      message:
        "Se o e-mail estiver cadastrado, voce recebera um codigo para recuperar a senha.",
    },
    passwordRecoveryCodeValidated: {
      code: "AUTH_PASSWORD_RECOVERY_CODE_VALIDATED",
      message: "Codigo validado com sucesso.",
    },
    passwordRecovered: {
      code: "AUTH_PASSWORD_RECOVERED",
      message: "Senha redefinida com sucesso.",
    },
  },
  users: {
    created: {
      code: "USER_CREATED",
      message: "Usuário criado com sucesso.",
    },
    updated: {
      code: "USER_UPDATED",
      message: "Usuário atualizado com sucesso.",
    },
    accessUpdated: {
      code: "USER_ACCESS_UPDATED",
      message: "Acesso do usuário atualizado com sucesso.",
    },
    unlocked: {
      code: "USER_UNLOCKED",
      message: "Usuário desbloqueado com sucesso.",
    },
    permissionsUpdated: {
      code: "USER_PAGE_PERMISSIONS_UPDATED",
      message: "Permissões de páginas do usuário atualizadas com sucesso.",
    },
    listed: {
      code: "USERS_LISTED",
      message: "Usuários carregados com sucesso.",
    },
  },
  customers: {
    created: {
      code: "CUSTOMER_CREATED",
      message: "Cliente criado com sucesso.",
    },
    updated: {
      code: "CUSTOMER_UPDATED",
      message: "Cliente atualizado com sucesso.",
    },
    listed: {
      code: "CUSTOMERS_LISTED",
      message: "Clientes carregados com sucesso.",
    },
  },
  employees: {
    created: {
      code: "EMPLOYEE_CREATED",
      message: "Funcionário criado com sucesso.",
    },
    updated: {
      code: "EMPLOYEE_UPDATED",
      message: "Funcionário atualizado com sucesso.",
    },
    listed: {
      code: "EMPLOYEES_LISTED",
      message: "Funcionários carregados com sucesso.",
    },
  },
  profiles: {
    updated: {
      code: "PROFILE_UPDATED",
      message: "Perfil atualizado com sucesso.",
    },
  },
} as const;
