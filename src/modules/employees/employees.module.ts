// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

// ENTITIES
import { EmployeesEntity } from "./entities/employees.entity";
import { UserEntity } from "../users/entities/user.entity";
import { ProfileEntity } from "../profiles/entities/profile.entity";

// SERVICES
import { CreateEmployeesService } from "./services/create/create-employees.service";
import { GetEmployeesService } from "./services/get/get-employees.service";
import { UpdateEmployeesService } from "./services/update/update-employees.service";

// RESOLVERS
import { CreateEmployeesResolver } from "./resolvers/create/create-employees.resolver";
import { GetEmployeesResolver } from "./resolvers/get/get-employees.resolver";
import { UpdateEmployeesResolver } from "./resolvers/update/update-employees.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeesEntity, UserEntity, ProfileEntity]),
  ],
  providers: [
    CreateEmployeesService,
    CreateEmployeesResolver,
    GetEmployeesService,
    GetEmployeesResolver,
    UpdateEmployeesService,
    UpdateEmployeesResolver,
  ],
  exports: [CreateEmployeesService, GetEmployeesService],
})
export class EmployeesModule {}
