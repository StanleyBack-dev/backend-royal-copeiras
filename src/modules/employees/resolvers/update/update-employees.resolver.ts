import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { UpdateEmployeesService } from "../../services/update/update-employees.service";
import { UpdateEmployeesInputDto } from "../../dtos/update/update-employees-input.dto";
import { UpdateEmployeesResponseDto } from "../../dtos/update/update-employees-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver(() => UpdateEmployeesResponseDto)
export class UpdateEmployeesResolver {
  constructor(
    private readonly updateEmployeesService: UpdateEmployeesService,
  ) {}

  @Mutation(() => UpdateEmployeesResponseDto, { name: "updateEmployees" })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async updateEmployees(
    @CurrentUser() user: unknown,
    @Args("input") input: UpdateEmployeesInputDto,
  ): Promise<UpdateEmployeesResponseDto> {
    return this.updateEmployeesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    ) as unknown as UpdateEmployeesResponseDto;
  }
}
