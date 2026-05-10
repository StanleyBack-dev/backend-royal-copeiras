import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PaymentsEntity } from "../../entities/payments.entity";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { UpdatePaymentResponseDto } from "../../dtos/update/update-payment-response.dto";
import { IPayment } from "../../interfaces/payment.interface";
import { UpdatePaymentValidator } from "../../validators/update/update-payment.validator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";

@Injectable()
export class UpdatePaymentsService {
  constructor(
    @InjectRepository(PaymentsEntity)
    private readonly paymentsRepository: Repository<PaymentsEntity>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async execute(
    userId: string,
    input: UpdatePaymentInputDto,
  ): Promise<IPayment> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_BUDGETS,
    );

    const updated = await UpdatePaymentValidator.validateAndUpdate(
      userId,
      input,
      this.paymentsRepository,
    );

    return UpdatePaymentResponseDto.fromEntity(updated);
  }
}
