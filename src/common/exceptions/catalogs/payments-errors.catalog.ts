import { HttpStatus } from "@nestjs/common";

export const paymentsErrors = {
  idRequired: {
    code: "PAYMENTS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idPayments é obrigatório.",
  },
  notFound: {
    code: "PAYMENTS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Pagamento não encontrado.",
  },
  noneFound: {
    code: "PAYMENTS_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum pagamento encontrado.",
  },
  invalidStatus: {
    code: "PAYMENTS_INVALID_STATUS",
    status: HttpStatus.BAD_REQUEST,
    message: "Status de pagamento inválido.",
  },
  statusRequired: {
    code: "PAYMENTS_STATUS_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O status do pagamento é obrigatório.",
  },
  invalidStatusTransition: {
    code: "PAYMENTS_INVALID_STATUS_TRANSITION",
    status: HttpStatus.BAD_REQUEST,
    message: "Transição de status de pagamento não permitida.",
  },
  invalidAmount: {
    code: "PAYMENTS_INVALID_AMOUNT",
    status: HttpStatus.BAD_REQUEST,
    message: "Valor de pagamento inválido.",
  },
  paidAmountRequired: {
    code: "PAYMENTS_PAID_AMOUNT_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O valor pago é obrigatório.",
  },
  paymentAmountExceedsPlanned: {
    code: "PAYMENTS_AMOUNT_EXCEEDS_PLANNED",
    status: HttpStatus.BAD_REQUEST,
    message: "Valor pago não pode exceder o valor previsto.",
  },
  dueDateRequired: {
    code: "PAYMENTS_DUE_DATE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "A data de vencimento é obrigatória.",
  },
  proofRequired: {
    code: "PAYMENTS_PROOF_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O comprovante de pagamento é obrigatório.",
  },
  paymentDateRequired: {
    code: "PAYMENTS_PAYMENT_DATE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "A data de pagamento é obrigatória para confirmar pagamento.",
  },
  leadRequired: {
    code: "PAYMENTS_LEAD_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O lead relacionado é obrigatório.",
  },
  leadNotFound: {
    code: "PAYMENTS_LEAD_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Lead relacionado não encontrado.",
  },
  referenceRequired: {
    code: "PAYMENTS_REFERENCE_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O pagamento deve estar vinculado a um contrato ou evento.",
  },
};
