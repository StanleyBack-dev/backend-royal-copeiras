import { HttpStatus } from "@nestjs/common";

export const publicIntakeErrors = {
  codeInvalidOrExpired: {
    code: "PUBLIC_INTAKE_CODE_INVALID_OR_EXPIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "Código inválido ou expirado.",
  },
  formTokenInvalidOrExpired: {
    code: "PUBLIC_INTAKE_FORM_TOKEN_INVALID_OR_EXPIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O link deste formulário expirou. Peça um novo código.",
  },
  eventScheduleLengthMismatch: {
    code: "PUBLIC_INTAKE_EVENT_SCHEDULE_LENGTH_MISMATCH",
    status: HttpStatus.BAD_REQUEST,
    message:
      "A quantidade de datas, horários de chegada e de partida deve ser a mesma.",
  },
} as const;
