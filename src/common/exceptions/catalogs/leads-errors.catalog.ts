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
  noUpdateData: {
    code: "LEADS_NO_UPDATE_DATA",
    status: HttpStatus.BAD_REQUEST,
    message: "Nenhum dado foi fornecido para atualização do lead.",
  },
  editForbidden: {
    code: "LEADS_EDIT_FORBIDDEN",
    status: HttpStatus.FORBIDDEN,
    message: "Você não tem permissão para editar este lead.",
  },
  invalidStatusTransition: {
    code: "LEADS_INVALID_STATUS_TRANSITION",
    status: HttpStatus.BAD_REQUEST,
    message: "Transição de status do lead não permitida.",
  },
};
