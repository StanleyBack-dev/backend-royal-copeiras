import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";
import { VerifyPublicIntakeCodeResponseDto } from "../../dtos/verify/verify-public-intake-code-response.dto";
import { PublicIntakeCodesService } from "../public-intake-codes.service";

@Injectable()
export class VerifyPublicIntakeCodeService {
  constructor(
    private readonly publicIntakeCodesService: PublicIntakeCodesService,
    @InjectRepository(SuppliesEntity)
    private readonly suppliesRepository: Repository<SuppliesEntity>,
  ) {}

  async execute(code: string): Promise<VerifyPublicIntakeCodeResponseDto> {
    const activeCode =
      await this.publicIntakeCodesService.findActiveByCode(code);

    if (!activeCode) {
      throw AppException.from(
        APP_ERRORS.publicIntake.codeInvalidOrExpired,
        undefined,
      );
    }

    const verified =
      await this.publicIntakeCodesService.markVerified(activeCode);

    // The public form needs the operator's own materials catalog to offer the
    // same "pick from catalog" select as the private budget form.
    const supplies = await this.suppliesRepository.find({
      where: { idUsers: activeCode.idUsers, isActive: true },
      order: { name: "ASC" },
    });

    return {
      ...verified,
      supplies: supplies.map((supply) => ({
        idSupplies: supply.idSupplies,
        name: supply.name,
        defaultUnit: supply.defaultUnit ?? null,
      })),
    };
  }
}
