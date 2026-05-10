import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from "typeorm";
import { PaymentsEntity } from "../../entities/payments.entity";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { CreatePaymentResponseDto } from "../../dtos/create/create-payment-response.dto";
import { IPayment } from "../../interfaces/payment.interface";
import { CreatePaymentValidator } from "../../validators/create/create-payment.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { LeadsEntity } from "../../../leads/entities/leads.entity";

@Injectable()
export class CreatePaymentsService {
  constructor(
    @InjectRepository(PaymentsEntity)
    private readonly paymentsRepository: Repository<PaymentsEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: CreatePaymentInputDto,
  ): Promise<IPayment> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const created = await CreatePaymentValidator.validateAndCreate(
      userId,
      input,
      this.paymentsRepository,
      this.leadsRepository,
    );

    return CreatePaymentResponseDto.fromEntity(created);
  }

  async executeInternal(
    userId: string,
    input: CreatePaymentInputDto,
    manager?: EntityManager,
  ): Promise<PaymentsEntity> {
    const paymentsRepo = manager
      ? manager.getRepository(PaymentsEntity)
      : this.paymentsRepository;
    const leadsRepo = manager
      ? manager.getRepository(LeadsEntity)
      : this.leadsRepository;

    return CreatePaymentValidator.validateAndCreate(
      userId,
      input,
      paymentsRepo,
      leadsRepo,
    );
  }
}
