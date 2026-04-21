import { HttpStatus } from "@nestjs/common";

export const signaturesErrors = {
  integrationNotConfigured: {
    code: "SIGNATURES_INTEGRATION_NOT_CONFIGURED",
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message:
      "Integracao de assinatura nao configurada. Verifique as variaveis da Assinafy.",
  },
  providerRequestFailed: {
    code: "SIGNATURES_PROVIDER_REQUEST_FAILED",
    status: HttpStatus.BAD_GATEWAY,
    message: "Falha ao comunicar com o provedor de assinatura.",
  },
  requestNotFound: {
    code: "SIGNATURES_REQUEST_NOT_FOUND",
    status: HttpStatus.NOT_FOUND,
    message: "Solicitacao de assinatura nao encontrada.",
  },
  invalidPayload: {
    code: "SIGNATURES_INVALID_PAYLOAD",
    status: HttpStatus.BAD_REQUEST,
    message: "Payload de assinatura invalido.",
  },
};
