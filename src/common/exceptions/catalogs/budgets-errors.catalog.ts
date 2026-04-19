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
  leadRequired: {
    code: "BUDGETS_LEAD_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O lead é obrigatório para criar ou atualizar o orçamento.",
  },
  leadInactive: {
    code: "BUDGETS_LEAD_INACTIVE",
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: "Não é permitido criar ou gerar orçamento para lead inativo.",
  },
  eventDatesRequired: {
    code: "BUDGETS_EVENT_DATES_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "Informe pelo menos uma data válida para o evento.",
  },
  eventLocationRequired: {
    code: "BUDGETS_EVENT_LOCATION_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O local do evento é obrigatório.",
  },
  guestCountRequired: {
    code: "BUDGETS_GUEST_COUNT_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A quantidade de convidados é obrigatória e deve ser maior que zero.",
  },
  durationHoursRequired: {
    code: "BUDGETS_DURATION_HOURS_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A duração do evento é obrigatória e deve estar entre 1 e 24 horas.",
  },
  paymentMethodRequired: {
    code: "BUDGETS_PAYMENT_METHOD_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "A forma de pagamento é obrigatória.",
  },
  paymentMethodInvalid: {
    code: "BUDGETS_PAYMENT_METHOD_INVALID",
    status: HttpStatus.BAD_REQUEST,
    message: "A forma de pagamento informada não é válida.",
  },
  advancePercentageRequired: {
    code: "BUDGETS_ADVANCE_PERCENTAGE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A porcentagem de entrada é obrigatória e deve estar entre 0 e 100.",
  },
  itemDescriptionRequired: {
    code: "BUDGETS_ITEM_DESCRIPTION_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "Todos os itens do orçamento devem possuir descrição.",
  },
  itemServiceTypeInvalid: {
    code: "BUDGETS_ITEM_SERVICE_TYPE_INVALID",
    status: HttpStatus.BAD_REQUEST,
    message:
      "Um ou mais itens possuem tipo de serviço inválido para orçamento.",
  },
  itemServiceTypeDuplicated: {
    code: "BUDGETS_ITEM_SERVICE_TYPE_DUPLICATED",
    status: HttpStatus.BAD_REQUEST,
    message:
      "Não é permitido repetir o mesmo tipo de serviço em itens do orçamento.",
  },
  invalidValidityRange: {
    code: "BUDGETS_INVALID_VALIDITY_RANGE",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A validade do orçamento deve ser maior ou igual à data de emissão.",
  },
  noUpdateData: {
    code: "BUDGETS_NO_UPDATE_DATA",
    status: HttpStatus.BAD_REQUEST,
    message: "Nenhum dado foi fornecido para atualização do orçamento.",
  },
  editForbidden: {
    code: "BUDGETS_EDIT_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message: "Somente orçamentos em rascunho podem ter dados editados.",
  },
  invalidStatusTransition: {
    code: "BUDGETS_INVALID_STATUS_TRANSITION",
    status: HttpStatus.BAD_REQUEST,
    message: "Transição de status do orçamento não permitida.",
  },
  previewSourceRequired: {
    code: "BUDGETS_PREVIEW_SOURCE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "Informe idBudgets ou draft para gerar o preview do orçamento.",
  },
  leadHasNoEmail: {
    code: "BUDGETS_LEAD_HAS_NO_EMAIL",
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: "O lead vinculado a este orçamento não possui e-mail cadastrado.",
  },
  emailSendFailed: {
    code: "BUDGETS_EMAIL_SEND_FAILED",
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Não foi possível enviar o e-mail do orçamento. Tente novamente.",
  },
};
