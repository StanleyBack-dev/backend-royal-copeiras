import { BadRequestException, NotFoundException } from "@nestjs/common";
import { GetProfileInputDto } from "../../dtos/get/get-profile-input.dto";
import { ProfileEntity } from "../../entities/profile.entity";
import { Repository } from "typeorm";

export class GetProfileValidator {
  static ensureValidInput(input?: GetProfileInputDto): void {
    if (!input) {
      throw new BadRequestException("Parâmetros de busca não informados.");
    }

    if (!input.idProfiles) {
      throw new BadRequestException(
        "Informe o idProfiles para buscar o perfil.",
      );
    }
  }

  static async ensureProfileExists(
    input: GetProfileInputDto,
    repository: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    this.ensureValidInput(input);

    const profile = await repository.findOne({
      where: { idProfiles: input.idProfiles },
      relations: ["user"],
    });

    if (!profile) {
      throw new NotFoundException("Perfil não encontrado.");
    }

    return profile;
  }

  static async ensureProfileExistsByUser(
    userId: string,
    repository: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    const profile = await repository.findOne({
      where: { user: { idUsers: userId } },
      relations: ["user"],
    });

    if (!profile) {
      throw new NotFoundException("Perfil não encontrado para este usuário.");
    }

    return profile;
  }
}
