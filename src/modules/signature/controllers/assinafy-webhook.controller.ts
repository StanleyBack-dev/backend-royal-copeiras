import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
  Req,
} from "@nestjs/common";
import { Public } from "../../../common/decorators/public.decorator";
import { ConfigService } from "@nestjs/config";
import { ProcessSignatureCallbackService } from "../services/process-signature-callback.service";
import crypto from "crypto";
import type { Request } from "express";

@Controller("signature/webhook")
export class AssinafyWebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly processor: ProcessSignatureCallbackService,
  ) {}

  @Public()
  @Post("/assinafy")
  @HttpCode(200)
  async handleAssinafy(
    @Req() req: Request & { rawBody?: string },
    @Body() body: Record<string, unknown>,
    @Headers() headers: Record<string, string>,
  ) {
    const secret = this.configService.get<string>("ASSINAFY_WEBHOOK_SECRET");
    if (secret) {
      const incoming = (
        headers["x-assinafy-signature"] ||
        headers["x-assinafy-signature".toLowerCase()] ||
        ""
      ).trim();
      if (!incoming) throw new UnauthorizedException();

      const raw = req.rawBody || JSON.stringify(body || {});
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(raw)
        .digest("hex");

      // support signatures optionally prefixed like 'sha256=...'
      const normalizedIncoming = incoming.includes("=")
        ? incoming.split("=").pop()
        : incoming;
      if (!normalizedIncoming || normalizedIncoming !== hmac) {
        throw new UnauthorizedException();
      }
    }

    // attach request metadata to payload so processor can persist IP/UA
    const payload = body as Record<string, unknown> & {
      signerIp?: string;
      signerUserAgent?: string;
    };
    try {
      payload.signerIp =
        payload.signerIp ||
        (req.headers["x-forwarded-for"] as string) ||
        req.ip ||
        (req.socket && req.socket.remoteAddress);
    } catch {
      void 0;
    }
    try {
      payload.signerUserAgent =
        payload.signerUserAgent || (req.headers["user-agent"] as string);
    } catch {
      void 0;
    }

    await this.processor.processAssinafyCallback(payload);
    return { ok: true };
  }
}
