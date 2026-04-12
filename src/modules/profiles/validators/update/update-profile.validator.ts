import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { ProfileEntity } from "../../entities/profile.entity";
import { UpdateProfileInputDto } from "../../dtos/update/update-profile-input.dto";

export class UpdateProfileValidator {
  private static ensureHasFields(input?: UpdateProfileInputDto): void {
    if (!input) {
      throw new BadRequestException(
        "Nenhum dado foi fornecido para atualização.",
      );
    }

    const hasField = Object.values(input).some(
      (value) => value !== undefined && value !== null,
    );
    if (!hasField) {
      throw new BadRequestException(
        "É necessário fornecer pelo menos um campo para atualizar.",
      );
    }
  }

  private static validateEnums(input: UpdateProfileInputDto): void {
    const sexOptions = ["male", "female", "other"];
    const activityOptions = [
      "sedentary",
      "light",
      "moderate",
      "active",
      "very_active",
    ];
    const goalOptions = ["lose_weight", "maintain", "gain_weight"];

    if (input.sex && !sexOptions.includes(input.sex)) {
      throw new BadRequestException(
        `sex inválido. Opções válidas: ${sexOptions.join(", ")}`,
      );
    }

    if (input.activityLevel && !activityOptions.includes(input.activityLevel)) {
      throw new BadRequestException(
        `activityLevel inválido. Opções válidas: ${activityOptions.join(", ")}`,
      );
    }

    if (input.goal && !goalOptions.includes(input.goal)) {
      throw new BadRequestException(
        `goal inválido. Opções válidas: ${goalOptions.join(", ")}`,
      );
    }
  }

  private static validateHeight(heightM?: number): void {
    if (heightM === undefined || heightM === null) return;

    if (typeof heightM !== "number" || isNaN(heightM)) {
      throw new BadRequestException("A altura deve ser um número.");
    }

    if (heightM < 0.5 || heightM > 3.0) {
      throw new BadRequestException("Altura deve estar entre 0,5 m e 3,0 m.");
    }
  }

  private static async ensureProfileExists(
    userId: string,
    profileRepo: Repository<ProfileEntity>,
  ): Promise<ProfileEntity> {
    const profile = await profileRepo.findOne({
      where: { user: { idUsers: userId } },
      relations: ["user"],
    });

    if (!profile) {
      throw new NotFoundException("Perfil não encontrado para este usuário.");
    }

    if (profile.user.idUsers !== userId) {
      throw new ForbiddenException(
        "Você não tem permissão para editar este perfil.",
      );
    }

    return profile;
  }

  static async validateAndUpdate(
    userId: string,
    input: UpdateProfileInputDto,
    repo: Repository<ProfileEntity>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ProfileEntity> {
    this.ensureHasFields(input);
    this.validateEnums(input);
    this.validateHeight(input.heightM);

    const profile = await this.ensureProfileExists(userId, repo);

    if (input.phone !== undefined) profile.phone = input.phone;
    if (input.birthDate !== undefined) profile.birthDate = input.birthDate;
    if (input.sex !== undefined) profile.sex = input.sex;
    if (input.heightM !== undefined) profile.heightM = input.heightM;
    if (input.activityLevel !== undefined)
      profile.activityLevel = input.activityLevel;
    if (input.goal !== undefined) profile.goal = input.goal;

    if (ipAddress) profile.ipAddress = ipAddress;
    if (userAgent) profile.userAgent = userAgent;

    return repo.save(profile);
  }
}
