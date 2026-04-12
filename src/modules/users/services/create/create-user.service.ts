import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class CreateUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) { }

  async execute(data: Partial<UserEntity>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }
}