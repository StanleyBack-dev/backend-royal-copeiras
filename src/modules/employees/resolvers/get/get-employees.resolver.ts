import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetEmployeesService } from "../../services/get/get-employees.service";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";
import { GetEmployeesListResponseDto } from "../../dtos/get/get-employees-list-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";
import { buildPaginatedListResponse } from "../../../../common/responses/helpers/response.helper";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";

@Resolver(() => GetEmployeesListResponseDto)
export class GetEmployeesResolver {
  constructor(private readonly getEmployeesService: GetEmployeesService) {}

  @Query(() => GetEmployeesListResponseDto, { name: "getEmployees" })
  @RequirePermissions(AuthPermission.READ_EMPLOYEES)
  async getEmployees(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetEmployeesInputDto,
  ) {
    const result = await this.getEmployeesService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      result,
      RESPONSE_MESSAGES.employees.listed,
    );
  }
}
