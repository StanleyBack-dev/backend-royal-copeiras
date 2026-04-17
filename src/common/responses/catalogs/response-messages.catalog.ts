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
