import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateEmployeesService } from "../../services/update/update-employees.service";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { UpdateEmployeesMutationResponseDto } from "../../dtos/update/update-employees-mutation-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => UpdateEmployeesMutationResponseDto)
export class UpdateEmployeesResolver {
  constructor(
    private readonly updateEmployeesService: UpdateEmployeesService,
  ) {}

  @Mutation(() => UpdateEmployeesMutationResponseDto, { name: "updateEmployees" })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async updateEmployees(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateEmployeesInputDto,
  ) {
    const employee = await this.updateEmployeesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildDataResponse(
      employee,
      RESPONSE_MESSAGES.employees.updated,
    );
  }
}
