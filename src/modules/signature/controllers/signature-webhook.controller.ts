import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";
import { ProcessSignatureWebhookService } from "../services/process-signature-webhook.service";
import * as crypto from "crypto";

@Controller("api/signatures")
export class SignatureWebhookController {
  constructor(
    private readonly processor: ProcessSignatureWebhookService,
    private readonly config: ConfigService,
  ) {}

  @Get("/webhook")
  @Public()
  @HttpCode(200)
  verifyWebhook() {
    return { ok: true };
  }

  @Post("/webhook")
  @Public()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers() headers: Record<string, string>,
    @Body() body: unknown,
  ) {
    const secret =
      this.config.get<string>("ASSINAFY_WEBHOOK_SECRET") ||
      this.config.get<string>("SIGNATURE_WEBHOOK_SECRET");

    const signatureHeader =
      headers["x-assinafy-signature"] ||
      headers["x-assinafy-signature-256"] ||
      headers["x-webhook-signature"] ||
      headers["x-signature"] ||
      headers["x-hub-signature"] ||
      headers["x-hub-signature-256"];
    const tokenHeader =
      headers["x-assinafy-token"] ||
      headers["x-webhook-token"] ||
      headers["x-signature-token"];
    const expectedToken =
      this.config.get<string>("ASSINAFY_WEBHOOK_TOKEN") ||
      this.config.get<string>("SIGNATURE_WEBHOOK_TOKEN");

    if (secret && signatureHeader) {

      const raw: Buffer | undefined = req.rawBody;
      const payloadBuffer = raw ?? Buffer.from(JSON.stringify(body ?? ""));

      const hmac = crypto
        .createHmac("sha256", secret)
        .update(payloadBuffer)
        .digest("hex");
      // accept headers like "sha256=..." or raw hex
      const expectedSig = signatureHeader.startsWith("sha256=")
        ? signatureHeader.split("=")[1]
        : signatureHeader;

      const aBuff = Buffer.from(hmac, "hex");
      const bBuff = Buffer.from(expectedSig, "hex");

      if (
        aBuff.length !== bBuff.length ||
        !crypto.timingSafeEqual(aBuff, bBuff)
      ) {
        throw new UnauthorizedException();
      }
    } else if (expectedToken && tokenHeader !== expectedToken) {
      // If HMAC signature is absent, validate token when configured.
      throw new UnauthorizedException();
    }

    await this.processor.execute(body);
    return { ok: true };
  }
}
