import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { ProfileEntity } from "../../entities/profile.entity";
import { UserEntity } from "../../../users/entities/user.entity";
import { CreateProfileInputDto } from "../../dtos/create/create-profile-input.dto";

@Injectable()
export class CreateProfileValidator {
  constructor(
    @InjectRepository(ProfileEntity)
    private readonly profileRepository: Repository<ProfileEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  static ensureValidInput(
    input: Partial<CreateProfileInputDto> & { idUsers?: string },
  ): void {
    if (!input.idUsers) {
      throw new BadRequestException(
        "O ID do usuário é obrigatório para criar um perfil.",
      );
    }
  }

  async ensureUserExists(idUsers: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { idUsers } });
    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }
    return user;
  }

  async ensureUserHasNoProfile(idUsers: string): Promise<void> {
    const existing = await this.profileRepository.findOne({
      where: { idUsers },
    });
    if (existing) {
      throw new BadRequestException(
        "Este usuário já possui um perfil cadastrado.",
      );
    }
  }

  private validateHeight(heightM?: number): void {
    if (heightM === undefined || heightM === null) return;

    if (typeof heightM !== "number" || isNaN(heightM)) {
      throw new BadRequestException("A altura deve ser um número.");
    }

    if (heightM < 0.5 || heightM > 3.0) {
      throw new BadRequestException("Altura deve estar entre 0,5 m e 3,0 m.");
    }
  }

  async validateAndCreate(
    idUsers: string,
    input: CreateProfileInputDto,
    repo: Repository<ProfileEntity>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileEntity> {
    CreateProfileValidator.ensureValidInput({ idUsers });

    const user = await this.ensureUserExists(idUsers);
    await this.ensureUserHasNoProfile(idUsers);

    this.validateHeight(input.heightM);

    const profile = repo.create({
      user,
      idUsers,
      phone: input.phone,
      birthDate: input.birthDate,
      sex: input.sex,
      heightM: input.heightM,
      activityLevel: input.activityLevel,
      goal: input.goal,
      ipAddress,
      userAgent,
    });

    return repo.save(profile);
  }
}
