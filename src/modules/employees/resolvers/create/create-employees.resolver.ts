import { Resolver, Mutation, Args } from "@nestjs/graphql";
import { CreateEmployeesService } from "../../services/create/create-employees.service";
import { CreateEmployeesInputDto } from "../../dtos/create/create-employees-input.dto";
import { CreateEmployeesResponseDto } from "../../dtos/create/create-employees-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";
import { RequirePermissions } from "../../../auth/decorators/require-permissions.decorator";
import { AuthPermission } from "../../../auth/enums/auth-permission.enum";

@Resolver(() => CreateEmployeesResponseDto)
export class CreateEmployeesResolver {
  constructor(
    private readonly createEmployeesService: CreateEmployeesService,
  ) {}

  @Mutation(() => CreateEmployeesResponseDto, { name: "createEmployees" })
  @RequirePermissions(AuthPermission.MANAGE_EMPLOYEES)
  async createEmployees(
    @CurrentUser() user: unknown,
    @Args("input") input: CreateEmployeesInputDto,
  ): Promise<CreateEmployeesResponseDto> {
    return this.createEmployeesService.execute(
      (user as { idUsers: string }).idUsers,
      input,
    ) as unknown as CreateEmployeesResponseDto;
  }
}
