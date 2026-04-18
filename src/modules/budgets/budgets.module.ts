import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { BudgetsEntity } from "./entities/budgets.entity";
import { BudgetItemsEntity } from "./entities/budgetItems.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { CreateBudgetsService } from "./services/create/create-budgets.service";
import { GetBudgetsService } from "./services/get/get-budgets.service";
import { CreateBudgetsResolver } from "./resolvers/create/create-budgets.resolver";
import { GetBudgetsResolver } from "./resolvers/get/get-budgets.resolver";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([BudgetsEntity, BudgetItemsEntity, LeadsEntity]),
  ],
  providers: [
    CreateBudgetsService,
    CreateBudgetsResolver,
    GetBudgetsService,
    GetBudgetsResolver,
  ],
  exports: [CreateBudgetsService, GetBudgetsService],
})
export class BudgetsModule {}
