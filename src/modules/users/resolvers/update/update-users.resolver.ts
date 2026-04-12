import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UpdateUserService } from '../../services/update/update-user.service';
import { UpdateUserInputDto } from '../../dtos/update/update-user-input.dto';
import { UpdateUserResponseDto } from '../../dtos/update/update-user-response.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Resolver()
export class UpdateUserResolver {
  constructor(private readonly updateUserService: UpdateUserService) { }

  @Mutation(() => UpdateUserResponseDto)
  async updateUser(
    @CurrentUser() user: any,
    @Args('input') input: UpdateUserInputDto,
  ): Promise<UpdateUserResponseDto> {
    return this.updateUserService.execute(user.idUsers, input);
  }
}