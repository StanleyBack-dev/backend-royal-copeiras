import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { LeadsEntity } from "./entities/leads.entity";
import { CreateLeadsService } from "./services/create/create-leads.service";
import { GetLeadsService } from "./services/get/get-leads.service";
import { CreateLeadsResolver } from "./resolvers/create/create-leads.resolver";
import { GetLeadsResolver } from "./resolvers/get/get-leads.resolver";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([LeadsEntity])],
  providers: [
    CreateLeadsService,
    CreateLeadsResolver,
    GetLeadsService,
    GetLeadsResolver,
  ],
  exports: [CreateLeadsService, GetLeadsService],
})
export class LeadsModule {}
