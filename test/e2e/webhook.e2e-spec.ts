/* eslint-disable @typescript-eslint/no-require-imports */
const request = require("supertest");
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "../../src/app.module";
import { config } from "dotenv";
import * as crypto from "crypto";

config({ path: ".env.development" });

describe("Assinafy Webhook (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should accept webhook with valid HMAC and return ok", async () => {
    const payload = {
      id: "e2e-test-envelop",
      status: "signed",
      updated_at: new Date().toISOString(),
    };
    const body = JSON.stringify(payload);
    const secret = process.env.ASSINAFY_WEBHOOK_SECRET || "";
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const res = await request(app.getHttpServer())
      .post("/signature/webhook/assinafy")
      .set("Content-Type", "application/json")
      .set("x-assinafy-signature", sig)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
