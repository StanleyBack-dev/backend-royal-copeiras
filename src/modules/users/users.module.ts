// LIBS
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";


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
import { GetUsersResolver } from "./resolvers/get/get-users.resolver";
import { UpdateUserResolver } from "./resolvers/update/update-users.resolver";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    UpdateUserLoginService,
    UserExistsValidator,
    GetUsersResolver,
    UpdateUserResolver
  ],
  exports: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    UpdateUserLoginService,
  ],
})

export class UsersModule {}