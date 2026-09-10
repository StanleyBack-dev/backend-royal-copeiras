import { HttpStatus } from "@nestjs/common";

export const suppliesErrors = {
  duplicateName: {
    code: "SUPPLIES_DUPLICATE_NAME",
    status: HttpStatus.BAD_REQUEST,
    message: "Já existe um material com este nome.",
  },
  idRequired: {
    code: "SUPPLIES_ID_REQUIRED",
    status: HttpStatus.BAD_REQUEST,
    message: "O campo idSupplies é obrigatório.",
  },
  notFound: {
    code: "SUPPLIES_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Material não encontrado.",
  },
  inactive: {
    code: "SUPPLIES_INACTIVE",
    status: HttpStatus.BAD_REQUEST,
    message: "Material inativo não pode ser usado nesta operação.",
  },
} as const;
