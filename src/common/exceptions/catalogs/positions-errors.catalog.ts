import { HttpStatus } from "@nestjs/common";

export const positionsErrors = {
  duplicateName: {
    code: "POSITIONS_DUPLICATE_NAME",
    status: HttpStatus.BAD_REQUEST,
    message: "Já existe um cargo com este nome.",
  },
  idRequired: {
    code: "POSITIONS_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idPositions é obrigatório.",
  },
  notFound: {
    code: "POSITIONS_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Cargo não encontrado.",
  },
  inactive: {
    code: "POSITIONS_INACTIVE",
    status: HttpStatus.BAD_REQUEST,
    message: "Cargo inativo não pode ser usado nesta operação.",
  },
} as const;
