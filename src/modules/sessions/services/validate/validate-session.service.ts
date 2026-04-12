import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from '../../entities/session.entity';

@Injectable()
export class ValidateSessionService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly repo: Repository<SessionEntity>,
  ) {}

  async execute(refreshToken: string, userId: string) {
    return this.repo.findOne({
      where: {
        refreshToken,
        idUsers: userId,
        sessionActive: true,
      },
      relations: ['user'],
    });
  }
}