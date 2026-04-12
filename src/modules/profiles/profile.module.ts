// LIBS
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { forwardRef } from "@nestjs/common";

// MODULES
import { UsersModule } from "../users/users.module";

// ENTITIES
import { ProfileEntity } from "./entities/profile.entity";
import { UserEntity } from "../users/entities/user.entity";

// SERVICES
import { CreateProfileService } from "./services/create/create-profile.service";
import { GetProfileService } from "./services/get/get-profile.service";
import { UpdateProfileService } from "./services/update/update-profile.service";

// RESOLVERS
import { GetProfileResolver } from "./resolvers/get/get-profile.resolver";
import { UpdateProfileResolver } from "./resolvers/update/update-profile.resolver";

// VALIDATORS
import { CreateProfileValidator } from "./validators/create/create-profile.validator";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProfileEntity, UserEntity]),
    forwardRef(() => UsersModule),
  ],
  providers: [
    CreateProfileService,
    GetProfileService,
    GetProfileResolver,
    UpdateProfileService,
    UpdateProfileResolver,
    CreateProfileValidator,
  ],
  exports: [CreateProfileService, GetProfileService, UpdateProfileService],
})

export class ProfilesModule {}