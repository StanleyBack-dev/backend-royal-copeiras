import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ConfigService } from '@nestjs/config';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

const expressApp = express();
let server: ReturnType<typeof createServer>;

async function handler(req: Request, res: Response) {
  try {
    if (!server) {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
      app.use(cookieParser());

      const config = app.get(ConfigService);
      const corsOptions = config.get('cors');
      app.enableCors(corsOptions);

      await app.init();
      server = createServer(expressApp);
    }

    return server.emit('request', req, res);
  } catch (err) {
    console.error('Erro ao inicializar NestJS:', err);
    res.statusCode = 500;
    res.end('Erro interno ao iniciar o servidor');
  }
}

module.exports = handler;