import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { EventEntity } from "./entities/event.entity";
import { EventAssignmentEntity } from "./entities/event-assignment.entity";
import { ContractsEntity } from "../contracts/entities/contracts.entity";
import { BudgetsEntity } from "../budgets/entities/budgets.entity";
import { EmployeesEntity } from "../employees/entities/employees.entity";
import { CreateEventFromSignedContractService } from "./services/internal/create-event-from-signed-contract.service";
import { GetEventsService } from "./services/get/get-events.service";
import { UpdateEventAssignmentService } from "./services/update/update-event-assignment.service";
import { GetEventsResolver } from "./resolvers/get/get-events.resolver";
import { UpdateEventAssignmentResolver } from "./resolvers/update/update-event-assignment.resolver";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      EventEntity,
      EventAssignmentEntity,
      ContractsEntity,
      BudgetsEntity,
      EmployeesEntity,
    ]),
  ],
  providers: [
    CreateEventFromSignedContractService,
    GetEventsService,
    UpdateEventAssignmentService,
    GetEventsResolver,
    UpdateEventAssignmentResolver,
  ],
  exports: [
    CreateEventFromSignedContractService,
    GetEventsService,
    UpdateEventAssignmentService,
  ],
})
export class EventsModule {}
