import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { LeadsEntity } from "./entities/leads.entity";
import { CreateLeadsService } from "./services/create/create-leads.service";
import { GetLeadsService } from "./services/get/get-leads.service";
import { UpdateLeadsService } from "./services/update/update-leads.service";
import { CreateLeadsResolver } from "./resolvers/create/create-leads.resolver";
import { GetLeadsResolver } from "./resolvers/get/get-leads.resolver";
import { UpdateLeadsResolver } from "./resolvers/update/update-leads.resolver";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([LeadsEntity])],
  providers: [
    CreateLeadsService,
    CreateLeadsResolver,
    GetLeadsService,
    GetLeadsResolver,
    UpdateLeadsService,
    UpdateLeadsResolver,
  ],
  exports: [CreateLeadsService, GetLeadsService, UpdateLeadsService],
})
export class LeadsModule {}
