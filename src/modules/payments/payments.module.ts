import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { PaymentsEntity } from "./entities/payments.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { BudgetsEntity } from "../budgets/entities/budgets.entity";
import { ContractsEntity } from "../contracts/entities/contracts.entity";
import { EmployeesEntity } from "../employees/entities/employees.entity";
import { EventEntity } from "../events/entities/event.entity";
import { PaymentItemEntity } from "./entities/payment-item.entity";
import { CreatePaymentsService } from "./services/create/create-payments.service";
import { UpdatePaymentsService } from "./services/update/update-payments.service";
import { GetPaymentsService } from "./services/get/get-payments.service";
import { CreatePaymentsResolver } from "./resolvers/create/create-payments.resolver";
import { UpdatePaymentsResolver } from "./resolvers/update/update-payments.resolver";
import { GetPaymentsResolver } from "./resolvers/get/get-payments.resolver";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      PaymentsEntity,
      LeadsEntity,
      BudgetsEntity,
      ContractsEntity,
      EmployeesEntity,
      EventEntity,
      PaymentItemEntity,
    ]),
  ],
  providers: [
    CreatePaymentsService,
    UpdatePaymentsService,
    GetPaymentsService,
    CreatePaymentsResolver,
    UpdatePaymentsResolver,
    GetPaymentsResolver,
  ],
  exports: [CreatePaymentsService, UpdatePaymentsService, GetPaymentsService],
})
export class PaymentsModule {}
