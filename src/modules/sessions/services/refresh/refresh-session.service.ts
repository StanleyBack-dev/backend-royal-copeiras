import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SaveSessionService } from '../save/save-session.service';
import { SessionEntity } from '../../entities/session.entity';

@Injectable()
export class RefreshSessionService {
  constructor(
    private readonly saveSessionService: SaveSessionService,
  ) {}

  async execute(session: SessionEntity) {
    if (session.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Sessão expirada.');
    }

    session.lastUsedAt = new Date();
    await this.saveSessionService.execute(session);
  }
}