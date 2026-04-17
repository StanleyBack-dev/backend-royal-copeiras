import { HttpException, HttpStatus } from "@nestjs/common";
import { GraphQLFormattedError, GraphQLError } from "graphql";

type ExceptionBody = {
  code?: string;
  details?: unknown;
  error?: string;
  message?: string | string[];
  statusCode?: number;
};

function normalizeHttpException(exception: HttpException) {
  const response = exception.getResponse() as string | ExceptionBody;
  const body = typeof response === "string" ? { message: response } : response;
  const rawMessage = body.message;

  return {
    code: body.code ?? "HTTP_EXCEPTION",
    details: body.details ?? null,
    message: Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : (rawMessage ?? "Erro na requisição."),
    statusCode: body.statusCode ?? exception.getStatus(),
  };
}

export function formatGraphqlError(
  formattedError: GraphQLFormattedError,
  error: unknown,
): GraphQLFormattedError {
  const originalError =
    error instanceof GraphQLError ? error.originalError : undefined;

  if (originalError instanceof HttpException) {
    const normalized = normalizeHttpException(originalError);

    return {
      message: normalized.message,
      extensions: {
        code: normalized.code,
        details: normalized.details,
        statusCode: normalized.statusCode,
      },
    };
  }

  return {
    message: formattedError.message,
    extensions: {
      code:
        typeof formattedError.extensions?.code === "string"
          ? formattedError.extensions.code
          : "INTERNAL_SERVER_ERROR",
      details: null,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    },
  };
}
