// LIBS
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ENTITIES
import { SessionEntity } from './entities/session.entity';
import { UserEntity } from '../users/entities/user.entity';

// SERVICES
import { CreateSessionService } from './services/create/create-session.service';
import { ValidateSessionService } from './services/validate/validate-session.service';
import { RefreshSessionService } from './services/refresh/refresh-session.service';
import { RevokeSessionService } from './services/revoke/revoke-session.service';
import { SaveSessionService } from './services/save/save-session.service';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntity, UserEntity])],
  providers: [
    CreateSessionService,
    ValidateSessionService,
    RefreshSessionService,
    RevokeSessionService,
    SaveSessionService,
  ],
  exports: [
    CreateSessionService,
    ValidateSessionService,
    RefreshSessionService,
    RevokeSessionService,
  ],
})

export class SessionsModule {}