import {
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { ConfigService } from "@nestjs/config";
import { ProcessSignatureWebhookService } from "../services/process-signature-webhook.service";
import * as crypto from "crypto";

@Controller("api/signatures")
export class SignatureWebhookController {
  private readonly logger = new Logger(SignatureWebhookController.name);

  constructor(
    private readonly processor: ProcessSignatureWebhookService,
    private readonly config: ConfigService,
  ) {}

  @Get("/webhook")
  @Public()
  @HttpCode(200)
  verifyWebhook(@Query("token") token?: string) {
    const expected = this.config.get<string>("ASSINAFY_WEBHOOK_SECRET");
    if (expected && token !== expected) {
      throw new UnauthorizedException();
    }
    return { ok: true };
  }

  @Post("/webhook")
  @Public()
  @HttpCode(200)
  async handleWebhook(
    @Query("token") token: string | undefined,
    @Body() body: unknown,
  ) {
    const expectedSecret = this.config.get<string>("ASSINAFY_WEBHOOK_SECRET");
    const expectedAccountId = this.config.get<string>("ASSINAFY_ACCOUNT_ID");

    // Primary security: secret token in the webhook URL query string.
    // Register the URL as: https://api-royalcopeiras.vercel.app/api/signatures/webhook?token=<ASSINAFY_WEBHOOK_SECRET>
    if (expectedSecret) {
      if (
        !token ||
        !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedSecret))
      ) {
        this.logger.warn("Webhook rejected: invalid or missing token");
        throw new UnauthorizedException();
      }
    }

    // Secondary validation: account_id in payload must match configured account.
    if (expectedAccountId) {
      const p = body as Record<string, unknown> | null;
      const incomingAccountId =
        typeof p?.["account_id"] === "string" ? p["account_id"] : undefined;

      if (!incomingAccountId || incomingAccountId !== expectedAccountId) {
        this.logger.warn(
          `Webhook rejected: account_id mismatch (received: ${incomingAccountId ?? "none"})`,
        );
        throw new UnauthorizedException();
      }
    }

    await this.processor.execute(body);
    return { ok: true };
  }
}
