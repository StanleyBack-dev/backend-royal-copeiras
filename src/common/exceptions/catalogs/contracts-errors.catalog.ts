import { HttpStatus } from "@nestjs/common";

export const contractsErrors = {
  idRequired: {
    code: "CONTRACTS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idContracts e obrigatorio.",
  },
  notFound: {
    code: "CONTRACTS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Contrato nao encontrado.",
  },
  noneFound: {
    code: "CONTRACTS_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum contrato encontrado.",
  },
  noUpdateData: {
    code: "CONTRACTS_NO_UPDATE_DATA",
    status: HttpStatus.BAD_REQUEST,
    message: "Nenhum dado foi fornecido para atualizacao do contrato.",
  },
  editForbidden: {
    code: "CONTRACTS_EDIT_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message:
      "Este contrato nao pode ser editado pois ja foi processado. Apenas contratos em rascunho podem ser alterados.",
  },
  sendTrackingForbidden: {
    code: "CONTRACTS_SEND_TRACKING_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message:
      "So e possivel registrar envio de contratos em rascunho, gerados ou aguardando assinatura.",
  },
  invalidStatusTransition: {
    code: "CONTRACTS_INVALID_STATUS_TRANSITION",
    status: HttpStatus.BAD_REQUEST,
    message: "Transicao de status do contrato nao permitida.",
  },
  budgetRequired: {
    code: "CONTRACTS_BUDGET_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O idBudgets e obrigatorio para gerar contrato.",
  },
  budgetNotFound: {
    code: "CONTRACTS_BUDGET_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Orcamento vinculado ao contrato nao encontrado.",
  },
  budgetNotApproved: {
    code: "CONTRACTS_BUDGET_NOT_APPROVED",
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: "Somente orcamentos aprovados podem gerar contrato.",
  },
  leadHasNoEmail: {
    code: "CONTRACTS_LEAD_HAS_NO_EMAIL",
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: "Lead vinculado ao contrato nao possui email cadastrado.",
  },
  emailSendFailed: {
    code: "CONTRACTS_EMAIL_SEND_FAILED",
    status: HttpStatus.BAD_GATEWAY,
    message: "Falha ao enviar o contrato por email.",
  },
  alreadyExistsForBudget: {
    code: "CONTRACTS_ALREADY_EXISTS_FOR_BUDGET",
    status: HttpStatus.CONFLICT,
    message: "Ja existe contrato vinculado a este orcamento.",
  },
  invalidValidityRange: {
    code: "CONTRACTS_INVALID_VALIDITY_RANGE",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A validade do contrato deve ser maior ou igual a data de emissao.",
  },
  invalidInitialStatus: {
    code: "CONTRACTS_INVALID_INITIAL_STATUS",
    status: HttpStatus.BAD_REQUEST,
    message: "Status inicial do contrato nao permitido.",
  },
};
