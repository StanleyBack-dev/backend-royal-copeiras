import { Injectable } from "@nestjs/common";
import { CreateCustomersInputDto } from "../../dtos/create/create-customers-input.dto";
import { ICustomer } from "../../interface/customer.interface";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { AuthorizationService } from "../../../auth/services/authorization.service";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";

@Injectable()
export class CreateCustomersService {
  constructor(private readonly authorizationService: AuthorizationService) {}

  async execute(
    userId: string,
    _input: CreateCustomersInputDto,
  ): Promise<ICustomer> {
    await this.authorizationService.assertPermissionForUserId(
      userId,
      AuthPermission.MANAGE_CUSTOMERS,
    );

    throw AppException.from(
      APP_ERRORS.customers.manualCreateForbidden,
      undefined,
    );
  }
}
