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
      if (input.overtimeMinutes % 30 !== 0) {
        throw AppException.from(
          APP_ERRORS.events.overtimeInvalidInterval,
          undefined,
        );
      }

      event.overtimeMinutes = input.overtimeMinutes;
    }

    const saved = await this.eventsRepository.save(event);
    return UpdateEventsResponseDto.fromEntity(saved);
  }
}
