import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { randomInt, randomUUID } from "crypto";
import { IsNull, MoreThan, Not, Repository } from "typeorm";
import {
  dbLocalNow,
  toDbLocalTimestampString,
} from "../../../common/utils/to-db-local-timestamp.util";
import { PublicIntakeCodeEntity } from "../entities/public-intake-code.entity";

export interface IssuedPublicIntakeCode {
  code: string;
  expiresAt: string;
}

export interface IssuedFormToken {
  formToken: string;
  expiresAt: string;
}

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
    const expiresAt = this.toDbTimestampString(
      Date.now() + this.getCodeTtlMinutes() * 60 * 1000,
    );

    const entity = this.codesRepository.create({
      idUsers,
      code,
      expiresAt: this.asDate(expiresAt),
    });

    await this.codesRepository.save(entity);

    return { code, expiresAt };
  }

  async findActiveByCode(code: string): Promise<PublicIntakeCodeEntity | null> {
    return this.codesRepository.findOne({
      where: {
        code,
        invalidatedAt: IsNull(),
        consumedAt: IsNull(),
        expiresAt: MoreThan(this.dbNow()),
      },
      order: { createdAt: "DESC" },
    });
  }

  async markVerified(code: PublicIntakeCodeEntity): Promise<IssuedFormToken> {
    const formToken = randomUUID();
    const expiresAt = this.toDbTimestampString(
      Date.now() + this.getFormTtlMinutes() * 60 * 1000,
    );

    await this.codesRepository.update(
      { idPublicIntakeCodes: code.idPublicIntakeCodes },
      {
        verifiedAt: this.asDate(this.toDbTimestampString(Date.now())),
        formToken,
        formTokenExpiresAt: this.asDate(expiresAt),
      },
    );

    return { formToken, expiresAt };
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
        formTokenExpiresAt: MoreThan(this.dbNow()),
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
        consumedAt: this.asDate(this.toDbTimestampString(Date.now())),
        resultingLeadId: result.resultingLeadId,
        resultingBudgetId: result.resultingBudgetId,
      },
    );
  }

  private async invalidateOpenCodesForUser(idUsers: string): Promise<void> {
    await this.codesRepository.update(
      { idUsers, invalidatedAt: IsNull(), consumedAt: IsNull() },
      { invalidatedAt: this.asDate(this.toDbTimestampString(Date.now())) },
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

  private getDbTimezone(): string {
    return this.configService.get<string>("DB_TIMEZONE") ?? "America/Sao_Paulo";
  }

  /**
   * "Now", self-consistent with how TypeORM reads naive `timestamp`
   * columns back (see dbLocalNow's doc) — safe to bind directly into
   * MoreThan()/LessThan() comparisons against those columns.
   */
  private dbNow(): Date {
    return dbLocalNow(this.getDbTimezone());
  }

  private toDbTimestampString(epochMillis: number): string {
    return toDbLocalTimestampString(
      new Date(epochMillis),
      this.getDbTimezone(),
    );
  }

  /**
   * Entity columns are typed as Date, but we deliberately write the naive
   * wall-clock string instead (see toDbLocalTimestampString's doc) — pg
   * forwards a string parameter unchanged for a timestamp column, which a
   * Date object would not.
   */
  private asDate(naiveTimestampString: string): Date {
    return naiveTimestampString as unknown as Date;
  }
}
