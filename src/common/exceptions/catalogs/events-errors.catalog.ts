import { HttpStatus } from "@nestjs/common";

export const eventsErrors = {
  notFound: {
    code: "EVENTS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Evento não encontrado.",
  },
  assignmentNotFound: {
    code: "EVENT_ASSIGNMENT_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Alocação do evento não encontrada.",
  },
  employeeNotFound: {
    code: "EVENT_EMPLOYEE_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Funcionário não encontrado para alocação.",
  },
  employeeInactive: {
    code: "EVENT_EMPLOYEE_INACTIVE",
    status: HttpStatus.BAD_REQUEST,
    message: "O funcionário selecionado está inativo.",
  },
  employeeRequired: {
    code: "EVENT_EMPLOYEE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O funcionário é obrigatório para salvar a alocação.",
  },
  employeePaymentRequired: {
    code: "EVENT_EMPLOYEE_PAYMENT_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O pagamento do funcionário é obrigatório para salvar a alocação.",
  },
  overtimeInvalidInterval: {
    code: "EVENT_OVERTIME_INVALID_INTERVAL",
    status: HttpStatus.BAD_REQUEST,
    message:
      "As horas extras devem ser informadas em intervalos de 30 minutos.",
  },
  noUpdateData: {
    code: "EVENT_NO_UPDATE_DATA",
    status: HttpStatus.BAD_REQUEST,
    message: "Nenhum dado foi fornecido para atualização do evento.",
  },
  employeeGenderMismatch: {
    code: "EVENT_EMPLOYEE_GENDER_MISMATCH",
    status: HttpStatus.BAD_REQUEST,
    message:
      "O sexo do funcionário selecionado não é compatível com o tipo de serviço desta alocação.",
  },
  forbiddenEventAccess: {
    code: "EVENT_FORBIDDEN_ACCESS",
    status: HttpStatus.FORBIDDEN,
    message: "Você não tem permissão para acessar este evento.",
  },
} as const;
