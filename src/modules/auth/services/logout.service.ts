import { Injectable } from "@nestjs/common";
import { RevokeSessionService } from "../../sessions/services/revoke/revoke-session.service";

@Injectable()
export class LogoutService {
  constructor(private readonly revokeSessionService: RevokeSessionService) {}

  async execute(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.revokeSessionService.execute(refreshToken);
  }
}
