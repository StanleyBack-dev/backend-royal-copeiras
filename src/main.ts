// LIBS
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

// MODULES
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') || 4000;
  const corsOptions = config.get('cors');
  
  app.enableCors(corsOptions);

  await app.listen(port);
  console.log(`\n🚀 Servidor rodando em http://localhost:${port}/graphql`);
}

bootstrap();