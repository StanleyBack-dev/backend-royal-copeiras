import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CreateCustomersService } from '../../services/create/create-customers.service';
import { CreateCustomersInputDto } from '../../dtos/create/create-customers-input.dto';
import { CreateCustomersResponseDto } from '../../dtos/create/create-customers-response.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Resolver(() => CreateCustomersResponseDto)
export class CreateCustomersResolver {
  constructor(private readonly createCustomersService: CreateCustomersService) { }

  @Mutation(() => CreateCustomersResponseDto, { name: 'createCustomers' })
  async createCustomers(
    @CurrentUser() user: any,
    @Args('input') input: CreateCustomersInputDto,
  ): Promise<CreateCustomersResponseDto> {
    return this.createCustomersService.execute(user.idUsers, input);
  }
}