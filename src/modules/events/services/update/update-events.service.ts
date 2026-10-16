import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { EventEntity } from "../../entities/event.entity";
import { UpdateEventsInputDto } from "../../dtos/update/update-events-input.dto";
import { UpdateEventsResponseDto } from "../../dtos/update/update-events-response.dto";
import { EVENT_OVERTIME_INTERVAL_MINUTES } from "../../constants/event-overtime.constant";

@Injectable()
export class UpdateEventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdateEventsInputDto,
  ): Promise<UpdateEventsResponseDto> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const event = await this.eventsRepository.findOne({
      where: { idEvents: input.idEvents },
    });

    if (!event) {
      throw AppException.from(APP_ERRORS.events.notFound, undefined);
    }

    const hasUpdateData = Object.entries(input).some(
      ([key, value]) => key !== "idEvents" && value !== undefined,
    );

    if (!hasUpdateData) {
      throw AppException.from(APP_ERRORS.events.noUpdateData, undefined);
    }

    if (input.overtimeMinutes !== undefined) {
      if (input.overtimeMinutes % EVENT_OVERTIME_INTERVAL_MINUTES !== 0) {
        throw AppException.from(
          APP_ERRORS.events.overtimeInvalidInterval,
          undefined,
        );
      }

      event.overtimeMinutes = input.overtimeMinutes;
    }

    if (input.overtimeHourlyRate !== undefined) {
      event.overtimeHourlyRate = Number(input.overtimeHourlyRate.toFixed(2));
    }

    if (input.extraExpenses !== undefined) {
      event.extraExpenses = input.extraExpenses.map((expense) => ({
        category: expense.category,
        amount: Number(expense.amount.toFixed(2)),
      }));
    }

    if (input.status !== undefined) {
      event.status = input.status;
    }

    const saved = await this.eventsRepository.save(event);
    return UpdateEventsResponseDto.fromEntity(saved);
  }
}
