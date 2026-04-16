import { HttpStatus } from "@nestjs/common";

export const employeesErrors = {
  duplicateDocument: {
    code: "EMPLOYEES_DUPLICATE_DOCUMENT",
    status: HttpStatus.BAD_REQUEST,
    message: "Ja existe um funcionario com este documento.",
  },
  idRequired: {
    code: "EMPLOYEES_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idEmployees e obrigatorio.",
  },
  notFound: {
    code: "EMPLOYEES_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Funcionario nao encontrado.",
  },
  noneFound: {
    code: "EMPLOYEES_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum funcionario encontrado.",
  },
  editForbidden: {
    code: "EMPLOYEES_EDIT_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message: "Voce nao tem permissao para editar este funcionario.",
  },
} as const;
