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
import { CustomersModule } from "./modules/customers/customers.module";
import { EmployeesModule } from "./modules/employees/employees.module";
import { LeadsModule } from "./modules/leads/leads.module";
import { ContractsModule } from "./modules/contracts/contracts.module";
import { CompanyProfileModule } from "./modules/company-profile/company-profile.module";
import { MailModule } from "./modules/mails/mail.module";
import { AppConfigModule } from "./config/config.module";
import { isDeployedEnv } from "./config/environment.util";
import { DatabaseModule } from "./database/database.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { PdfGeneratorModule } from "./modules/pdf-generator/pdf-generator.module";
import { SignatureModule } from "./modules/signature/signature.module";
import { EventsModule } from "./modules/events/events.module";
import { PositionsModule } from "./modules/positions/positions.module";
import { AppController } from "./app.controller";

import { PaymentsModule } from "./modules/payments/payments.module";
import { RateLimitGuard } from "./common/guards/rate-limit.guard";

@Module({
  controllers: [AppController],
  imports: [
    AppConfigModule,
    DatabaseModule,
    MailModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: isDeployedEnv()
        ? true
        : join(process.cwd(), "src/graphql/schema.gql"),
      playground: true,
      context: ({ req, res }) => ({ req, res }),
      formatError: formatGraphqlError,
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    EmployeesModule,
    LeadsModule,
    ContractsModule,
    CompanyProfileModule,
    BudgetsModule,
    PdfGeneratorModule,
    SignatureModule,
    EventsModule,
    PositionsModule,
    PaymentsModule,
  ],
  providers: [RateLimitGuard, RequestInfoInterceptor],
})
export class AppModule {}
