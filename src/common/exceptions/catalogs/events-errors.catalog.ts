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
  forbiddenEventAccess: {
    code: "EVENT_FORBIDDEN_ACCESS",
    status: HttpStatus.FORBIDDEN,
    message: "Você não tem permissão para acessar este evento.",
  },
} as const;
