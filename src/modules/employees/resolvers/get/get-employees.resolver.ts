import { Resolver, Query, Args } from "@nestjs/graphql";
import { GetEmployeesService } from "../../services/get/get-employees.service";
import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";
import { GetEmployeesResponseDto } from "../../dtos/get/get-employees-response.dto";
import { CurrentUser } from "../../../../common/decorators/current-user.decorator";

@Resolver(() => GetEmployeesResponseDto)
export class GetEmployeesResolver {
  constructor(private readonly getEmployeesService: GetEmployeesService) {}

  @Query(() => [GetEmployeesResponseDto], { name: "getEmployees" })
  async getEmployees(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetEmployeesInputDto,
  ): Promise<GetEmployeesResponseDto[]> {
    return this.getEmployeesService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    ) as unknown as GetEmployeesResponseDto[];
  }
}
