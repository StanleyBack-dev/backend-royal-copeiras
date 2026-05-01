// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

// ENTITIES
import { CustomersEntity } from "./entities/customers.entity";
import { UserEntity } from "../users/entities/user.entity";
import { ContractsEntity } from "../contracts/entities/contracts.entity";
import { LeadsEntity } from "../leads/entities/leads.entity";
import { SignatureEntity } from "../signature/entities/signature.entity";

// SERVICES
import { CreateCustomersService } from "./services/create/create-customers.service";
import { GetCustomersService } from "./services/get/get-customers.service";
import { UpdateCustomersService } from "./services/update/update-customers.service";
import { CreateCustomerFromSignedContractService } from "./services/internal/create-customer-from-signed-contract.service";

// RESOLVERS
import { GetCustomersResolver } from "./resolvers/get/get-customers.resolver";
import { CreateCustomersResolver } from "./resolvers/create/create-customers.resolver";
import { UpdateCustomersResolver } from "./resolvers/update/update-customers.resolver";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      CustomersEntity,
      UserEntity,
      ContractsEntity,
      LeadsEntity,
      SignatureEntity,
    ]),
  ],
  providers: [
    CreateCustomersService,
    CreateCustomersResolver,
    GetCustomersService,
    GetCustomersResolver,
    UpdateCustomersService,
    UpdateCustomersResolver,
    CreateCustomerFromSignedContractService,
  ],
  exports: [
    CreateCustomersService,
    GetCustomersService,
    CreateCustomerFromSignedContractService,
  ],
})
export class CustomersModule {}
