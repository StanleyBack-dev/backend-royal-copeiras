import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CreateEmployeesService } from "../../services/create/create-employees.service";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";
import { CreateEmployeesMutationResponseDto } from "../../dtos/create/create-employees-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => CreateEmployeesMutationResponseDto)
export class CreateEmployeesResolver {
  constructor(
    private readonly createEmployeesService: CreateEmployeesService,
  ) {}

  @Mutation(() => CreateEmployeesMutationResponseDto, {
    name: "createEmployees",
  })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async createEmployees(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateEmployeesInputDto,
  ) {
    const employee = await this.createEmployeesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(employee, RESPONSE_MESSAGES.employees.created);
  }
}
