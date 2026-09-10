import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt, randomUUID } from "crypto";
import { IsNull, MoreThan, Not, Repository } from "typeorm";
import { formatLocalDateTime } from "../../../common/responses/format-local-datetime.util";
import { PublicIntakeCodeEntity } from "../entities/public-intake-code.entity";

export interface IssuedPublicIntakeCode {
  code: string;
  expiresAt: string;
}

export interface IssuedFormToken {
  formToken: string;
  expiresAt: string;
}

function toResponseTimestamp(value: Date): string {
  return formatLocalDateTime(value) ?? value.toISOString();
}

/**
 * Timestamps here follow the same convention as the rest of the project
 * (sessions, password-recovery, `@CreateDateColumn`): plain `Date` values
 * written straight to naive `timestamp` columns and expiry checked with
 * `MoreThan(new Date())` — no bespoke timezone shifting.
 */
@Injectable()
export class PublicIntakeCodesService {
  constructor(
    @InjectRepository(PublicIntakeCodeEntity)
    private readonly codesRepository: Repository<PublicIntakeCodeEntity>,
    private readonly configService: ConfigService,
  ) {}

  async issueCode(idUsers: string): Promise<IssuedPublicIntakeCode> {
    await this.invalidateOpenCodesForUser(idUsers);

    const code = randomInt(0, 1000000).toString().padStart(6, "0");
    const expiresAt = new Date(
      Date.now() + this.getCodeTtlMinutes() * 60 * 1000,
    );

    const entity = this.codesRepository.create({
      idUsers,
      code,
      expiresAt,
    });

    await this.codesRepository.save(entity);

    return { code, expiresAt: toResponseTimestamp(expiresAt) };
  }

  async findActiveByCode(code: string): Promise<PublicIntakeCodeEntity | null> {
    return this.codesRepository.findOne({
      where: {
        code,
        invalidatedAt: IsNull(),
        consumedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async markVerified(code: PublicIntakeCodeEntity): Promise<IssuedFormToken> {
    const formToken = randomUUID();
    const formTokenExpiresAt = new Date(
      Date.now() + this.getFormTtlMinutes() * 60 * 1000,
    );

    await this.codesRepository.update(
      { idPublicIntakeCodes: code.idPublicIntakeCodes },
      {
        verifiedAt: new Date(),
        formToken,
        formTokenExpiresAt,
      },
    );

    return { formToken, expiresAt: toResponseTimestamp(formTokenExpiresAt) };
  }

  async findByFormToken(
    formToken: string,
  ): Promise<PublicIntakeCodeEntity | null> {
    return this.codesRepository.findOne({
      where: {
        formToken,
        invalidatedAt: IsNull(),
        consumedAt: IsNull(),
        verifiedAt: Not(IsNull()),
        formTokenExpiresAt: MoreThan(new Date()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async consume(
    code: PublicIntakeCodeEntity,
    result: { resultingLeadId: string; resultingBudgetId: string },
  ): Promise<void> {
    await this.codesRepository.update(
      { idPublicIntakeCodes: code.idPublicIntakeCodes },
      {
        consumedAt: new Date(),
        resultingLeadId: result.resultingLeadId,
        resultingBudgetId: result.resultingBudgetId,
      },
    );
  }

  private async invalidateOpenCodesForUser(idUsers: string): Promise<void> {
    await this.codesRepository.update(
      { idUsers, invalidatedAt: IsNull(), consumedAt: IsNull() },
      { invalidatedAt: new Date() },
    );
  }

  private getCodeTtlMinutes(): number {
    return this.configService.get<number>(
      "PUBLIC_INTAKE_CODE_TTL_MINUTES",
      2880,
    );
  }

  private getFormTtlMinutes(): number {
    return this.configService.get<number>("PUBLIC_INTAKE_FORM_TTL_MINUTES", 60);
  }
}
