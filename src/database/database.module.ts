import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ({
          type: "postgres",
          host: configService.get("DB_HOST"),
          port: configService.get<number>("DB_PORT"),
          username: configService.get("DB_USER"),
          password: configService.get("DB_PASS"),
          database: configService.get("DB_NAME"),
          // Schema is managed exclusively through migrations (see datasource.ts
          // and `npm run migration:*`). `synchronize` stays off by default:
          // it drops/recreates FKs, indexes and enum types on every boot and
          // breaks against the shared payment enum types. Opt in locally with
          // DB_SYNCHRONIZE=true only for throwaway databases.
          synchronize: configService.get<boolean>("DB_SYNCHRONIZE") === true,
          logging: configService.get("TYPEORM_LOGGING") === true,
          ssl: configService.get("DB_SSL")
            ? { rejectUnauthorized: false }
            : false,
          extra: {
            options: `-c timezone=${configService.get<string>("DB_TIMEZONE") ?? "America/Sao_Paulo"}`,
          },
          autoLoadEntities: true,
        }) as PostgresConnectionOptions,
    }),
  ],
})
export class DatabaseModule {}
