import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { SuppliesEntity } from "./entities/supplies.entity";
import { UserEntity } from "../users/entities/user.entity";
import { CreateSuppliesService } from "./services/create/create-supplies.service";
import { GetSuppliesService } from "./services/get/get-supplies.service";
import { UpdateSuppliesService } from "./services/update/update-supplies.service";
import { CreateSuppliesResolver } from "./resolvers/create/create-supplies.resolver";
import { GetSuppliesResolver } from "./resolvers/get/get-supplies.resolver";
import { UpdateSuppliesResolver } from "./resolvers/update/update-supplies.resolver";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SuppliesEntity, UserEntity])],
  providers: [
    CreateSuppliesService,
    GetSuppliesService,
    UpdateSuppliesService,
    CreateSuppliesResolver,
    GetSuppliesResolver,
    UpdateSuppliesResolver,
  ],
  exports: [CreateSuppliesService, GetSuppliesService],
})
export class SuppliesModule {}
