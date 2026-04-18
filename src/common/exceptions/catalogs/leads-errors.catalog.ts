import { HttpStatus } from "@nestjs/common";

export const leadsErrors = {
  idRequired: {
    code: "LEADS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idLeads é obrigatório.",
  },
  notFound: {
    code: "LEADS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Lead não encontrado.",
  },
  noneFound: {
    code: "LEADS_NONE_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Nenhum lead encontrado.",
  },
};
