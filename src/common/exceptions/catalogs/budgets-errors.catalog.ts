import { HttpStatus } from "@nestjs/common";

export const budgetsErrors = {
  idRequired: {
    code: "BUDGETS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idBudgets é obrigatório.",
  },
  notFound: {
    code: "BUDGETS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Orçamento não encontrado.",
  },
  noneFound: {
    code: "BUDGETS_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum orçamento encontrado.",
  },
  itemsRequired: {
    code: "BUDGETS_ITEMS_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "É necessário informar pelo menos um item no orçamento.",
  },
  invalidValidityRange: {
    code: "BUDGETS_INVALID_VALIDITY_RANGE",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A validade do orçamento deve ser maior ou igual à data de emissão.",
  },
};
