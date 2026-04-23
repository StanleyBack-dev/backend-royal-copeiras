/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { AssinafyWebhookController } from "../controllers/assinafy-webhook.controller";
import crypto from "crypto";

describe("AssinafyWebhookController", () => {
  let controller: AssinafyWebhookController;
  let configService: any;
  let processor: any;

  beforeEach(() => {
    const secret = "a3f1c9e4d5b6f7a8c9d0e1f2a3b4c5d6";
    configService = { get: jest.fn().mockReturnValue(secret) };
    processor = {
      processAssinafyCallback: jest.fn().mockResolvedValue({ handled: true }),
    };
    // @ts-ignore
    controller = new AssinafyWebhookController(configService, processor);
  });

  it("accepts valid HMAC signature and delegates to processor", async () => {
    const body = { id: "env-1", status: "signed" };
    const raw = JSON.stringify(body);
    const secret = configService.get();
    const sig = crypto.createHmac("sha256", secret).update(raw).digest("hex");

    const req: any = { rawBody: raw };
    const headers: any = { "x-assinafy-signature": sig };

    const res = await controller.handleAssinafy(req, body, headers);
    expect(processor.processAssinafyCallback).toHaveBeenCalledWith(body);
    expect(res).toEqual({ ok: true });
  });

  it("throws UnauthorizedException for invalid signature", async () => {
    const body = { id: "env-1", status: "signed" };
    const req: any = { rawBody: JSON.stringify(body) };
    const headers: any = { "x-assinafy-signature": "bad" };

    await expect(
      controller.handleAssinafy(req, body, headers),
    ).rejects.toThrow();
  });
});
