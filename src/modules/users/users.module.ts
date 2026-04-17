// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";

// ENTITIES
import { UserEntity } from "./entities/user.entity";
import { AuthCredentialEntity } from "../auth/entities/auth-credential.entity";

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
import { AdminUpdateUserAccessResolver } from "./resolvers/update/admin-update-user-access.resolver";
import { AdminUpdateUserAccessService } from "./services/update/admin-update-user-access.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AuthCredentialEntity]), AuthModule],
  providers: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    AdminUpdateUserAccessService,
    UpdateUserLoginService,
    UserExistsValidator,
    CreateUserResolver,
    GetUsersResolver,
    UpdateUserResolver,
    AdminUpdateUserAccessResolver,
  ],
  exports: [
    CreateUserService,
    GetUsersService,
    UpdateUserService,
    UpdateUserLoginService,
  ],
})
export class UsersModule {}
