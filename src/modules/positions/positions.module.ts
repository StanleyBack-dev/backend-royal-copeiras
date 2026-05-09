import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { PositionsEntity } from "./entities/positions.entity";
import { UserEntity } from "../users/entities/user.entity";
import { CreatePositionsService } from "./services/create/create-positions.service";
import { GetPositionsService } from "./services/get/get-positions.service";
import { UpdatePositionsService } from "./services/update/update-positions.service";
import { CreatePositionsResolver } from "./resolvers/create/create-positions.resolver";
import { GetPositionsResolver } from "./resolvers/get/get-positions.resolver";
import { UpdatePositionsResolver } from "./resolvers/update/update-positions.resolver";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PositionsEntity, UserEntity]),
  ],
  providers: [
    CreatePositionsService,
    GetPositionsService,
    UpdatePositionsService,
    CreatePositionsResolver,
    GetPositionsResolver,
    UpdatePositionsResolver,
  ],
  exports: [CreatePositionsService, GetPositionsService],
})
export class PositionsModule {}
