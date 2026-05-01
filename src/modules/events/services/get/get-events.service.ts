import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { PageAccessKey } from "../../../auth/enums/page-access-key.enum";
import { EventEntity } from "../../entities/event.entity";
import { GetEventsInputDto } from "../../dtos/get/get-events-input.dto";
import { PaginatedResult } from "../../../../common/responses/interfaces/response.interface";
import { GetEventsResponseDto } from "../../dtos/get/get-events-response.dto";
import { GetEventsValidator } from "../../validators/get/get-events.validator";

@Injectable()
export class GetEventsService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventsRepository: Repository<EventEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(
    userId: string,
    input?: GetEventsInputDto,
  ): Promise<PaginatedResult<GetEventsResponseDto>> {
    await this.authorizationService.assertPageAccessForUserId(
      userId,
      PageAccessKey.EVENTS,
    );

    const records = await GetEventsValidator.validateAndFetchRecords(
      userId,
      input ?? {},
      this.eventsRepository,
    );

    return {
      ...records,
      items: records.items.map(GetEventsResponseDto.fromEntity),
    };
  }
}
