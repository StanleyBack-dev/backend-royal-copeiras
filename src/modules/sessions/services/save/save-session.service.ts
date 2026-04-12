import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../../entities/session.entity';

@Injectable()
export class SaveSessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repo: Repository<SessionEntity>,
  ) {}

  async execute(session: SessionEntity) {
    return this.repo.save(session);
  }
}