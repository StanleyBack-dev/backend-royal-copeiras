import { HttpStatus } from "@nestjs/common";

export const companyProfileErrors = {
  notFound: {
    code: "COMPANY_PROFILE_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Perfil da empresa não encontrado.",
  },
  noUpdateData: {
    code: "COMPANY_PROFILE_NO_UPDATE_DATA",
    status: HttpStatus.BAD_REQUEST,
    message: "Nenhum dado foi fornecido para atualização.",
  },
  requiredFieldEmpty: {
    code: "COMPANY_PROFILE_REQUIRED_FIELD_EMPTY",
    status: HttpStatus.BAD_REQUEST,
    message:
      "Razão social, nome fantasia e CNPJ são obrigatórios e não podem ficar em branco.",
  },
} as const;
