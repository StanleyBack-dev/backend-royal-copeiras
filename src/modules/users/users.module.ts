// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

// ENTITIES
import { UserEntity } from "./entities/user.entity";

// VALIDATORS
import { UserExistsValidator } from "./validators/user-exists.validator";

// SERVICES
import { GetUsersService } from "./services/get/get-users.service";
import { UpdateUserService } from "./services/update/update-user.service";
import { UpdateUserLoginService } from "./services/update/update-user-login.service";
import { CreateUserService } from "./services/create/create-user.service";

// RESOLVERS
import { CreateUserResolver } from "./resolvers/create/create-user.resolver";
import { GetUsersResolver } from "./resolvers/get/get-users.resolver";
import { UpdateUserResolver } from "./resolvers/update/update-users.resolver";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), AuthModule],
  providers: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    UpdateUserLoginService,
    UserExistsValidator,
    CreateUserResolver,
    GetUsersResolver,
    UpdateUserResolver,
  ],
  exports: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    UpdateUserLoginService,
  ],
})
export class UsersModule {}
