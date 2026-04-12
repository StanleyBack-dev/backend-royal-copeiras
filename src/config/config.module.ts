import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';
import { resolve } from 'path';
import corsConfig from './cors.config';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(process.cwd(), envFile),
      validationSchema: envValidationSchema,
      load: [corsConfig],
    }),
  ],
})

export class AppConfigModule {}