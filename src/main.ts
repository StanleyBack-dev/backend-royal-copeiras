// LIBS
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import type { Request } from "express";

// MODULES
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // capture raw body for webhook HMAC verification
  app.use(
    bodyParser.json({
      verify: (req: Request & { rawBody?: string }, _res, buf: Buffer) => {
        req.rawBody = buf && buf.length ? buf.toString() : "";
      },
    }),
  );
  app.use(
    bodyParser.urlencoded({
      extended: true,
      verify: (req: Request & { rawBody?: string }, _res, buf: Buffer) => {
        req.rawBody = buf && buf.length ? buf.toString() : "";
      },
    }),
  );
  app.use(cookieParser());

  const config = app.get(ConfigService);
  const port = config.get<number>("PORT") || 4000;
  const corsOptions = config.get("cors");

  app.enableCors(corsOptions);

  await app.listen(port);
  console.log(`\n🚀 Servidor rodando em http://localhost:${port}/graphql`);
}

bootstrap();
