import { HttpException } from "@nestjs/common";
import { AppErrorDefinition } from "./app-error-definition.type";

type ErrorParams<TDefinition extends AppErrorDefinition<unknown>> =
  TDefinition extends AppErrorDefinition<infer TParams> ? TParams : never;

function resolveMessage<TDefinition extends AppErrorDefinition<unknown>>(
  definition: TDefinition,
  params: ErrorParams<TDefinition>,
): string {
  if (typeof definition.message === "function") {
    return (definition.message as (args: ErrorParams<TDefinition>) => string)(
      params,
    );
  }

  return definition.message;
}

export class AppException extends HttpException {
  constructor(
    definition: AppErrorDefinition<unknown>,
    message: string,
    details?: unknown,
  ) {
    super(
      {
        code: definition.code,
        message,
        details,
      },
      definition.status,
    );
  }

  static from<TDefinition extends AppErrorDefinition<unknown>>(
    definition: TDefinition,
    params: ErrorParams<TDefinition>,
    details?: unknown,
  ): AppException {
    return new AppException(
      definition,
      resolveMessage(definition, params),
      details,
    );
  }
}
