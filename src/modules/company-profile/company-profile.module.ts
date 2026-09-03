// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

// ENTITIES
import { CompanyProfileEntity } from "./entities/company-profile.entity";

// SERVICES
import { GetCompanyProfileService } from "./services/get/get-company-profile.service";
import { UpdateCompanyProfileService } from "./services/update/update-company-profile.service";

// RESOLVERS
import { GetCompanyProfileResolver } from "./resolvers/get/get-company-profile.resolver";
import { UpdateCompanyProfileResolver } from "./resolvers/update/update-company-profile.resolver";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([CompanyProfileEntity])],
  providers: [
    GetCompanyProfileService,
    GetCompanyProfileResolver,
    UpdateCompanyProfileService,
    UpdateCompanyProfileResolver,
  ],
  exports: [GetCompanyProfileService],
})
export class CompanyProfileModule {}
