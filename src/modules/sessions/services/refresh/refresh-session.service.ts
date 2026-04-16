import { Injectable } from "@nestjs/common";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { SaveSessionService } from "../save/save-session.service";
import { SessionEntity } from "../../entities/session.entity";

@Injectable()
export class RefreshSessionService {
  constructor(private readonly saveSessionService: SaveSessionService) {}

  async execute(session: SessionEntity) {
    if (session.refreshTokenExpiresAt < new Date()) {
      throw AppException.from(APP_ERRORS.auth.expiredSession, undefined);
    }

    session.lastUsedAt = new Date();
    await this.saveSessionService.execute(session);
  }
}
