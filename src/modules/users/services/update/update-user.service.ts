import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { UpdateUserInputDto } from '../../dtos/update/update-user-input.dto';
import { UpdateUserResponseDto } from '../../dtos/update/update-user-response.dto';
import { UpdateUserValidator } from '../../validators/update/update-user-validator';

@Injectable()
export class UpdateUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) { }

  async execute(
    userId: string,
    input: UpdateUserInputDto
  ): Promise<UpdateUserResponseDto> {

    UpdateUserValidator.ensureValidUpdate(input);

    const user = await this.repo.findOne({
      where: { idUsers: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    user.name = input.name ?? user.name;
    user.urlAvatar = input.urlAvatar ?? user.urlAvatar;

    if (input.status !== undefined) {
      user.status = input.status;
      user.inactivatedAt = (input.status ? null : new Date()) as any;
    }

    const updated = await this.repo.save(user);

    return {
      idUsers: updated.idUsers,
      name: updated.name,
      email: updated.email,
      urlAvatar: updated.urlAvatar,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }
}