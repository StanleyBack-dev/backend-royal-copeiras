import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { GetUserInputDto } from '../../dtos/get/get-user-input.dto';
import { GetUserValidator } from '../../validators/get/get-user.validator';

@Injectable()
export class GetUsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) { }

  async findOne(input: GetUserInputDto) {
    GetUserValidator.ensureValidInput(input);

    const where = input.idUsers
      ? { idUsers: input.idUsers }
      : { email: input.email };

    const user = await this.repo.findOne({ where });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user;
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }


  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async findById(idUsers: string) {
    return this.repo.findOne({ where: { idUsers } });
  }
}