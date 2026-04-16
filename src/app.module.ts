// LIBS
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";

// INTERCEPTORS
import { formatGraphqlError } from "./common/exceptions/graphql-error.formatter";
import { RequestInfoInterceptor } from "./common/interceptors/request-info.interceptors";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProfilesModule } from "./modules/profiles/profile.module";
import { CustomersModule } from "./modules/customers/customers.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { AppConfigModule } from "./config/config.module";
import { DatabaseModule } from "./database/database.module";
import { MailModule } from "./shared/mails/mail.module";

import { RateLimitGuard } from "./common/guards/rate-limit.guard";

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    MailModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/graphql/schema.gql"),
      playground: true,
      context: ({ req, res }) => ({ req, res }),
      formatError: formatGraphqlError,
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    CustomersModule,
    EmployeesModule,
  ],
  providers: [RateLimitGuard, RequestInfoInterceptor],
})
export class AppModule {}
