import { HttpStatus } from "@nestjs/common";

export const customersErrors = {
  duplicateDocument: {
    code: "CUSTOMERS_DUPLICATE_DOCUMENT",
    status: HttpStatus.BAD_REQUEST,
    message: "Já existe um cliente com este documento.",
  },
  idRequired: {
    code: "CUSTOMERS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idCustomers é obrigatório.",
  },
  notFound: {
    code: "CUSTOMERS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Cliente não encontrado.",
  },
  noneFound: {
    code: "CUSTOMERS_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum cliente encontrado.",
  },
  editForbidden: {
    code: "CUSTOMERS_EDIT_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message: "Você não tem permissão para editar este cliente.",
  },
} as const;
