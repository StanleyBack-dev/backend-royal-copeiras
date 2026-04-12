import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UpdateProfileService } from '../../services/update/update-profile.service';
import { UpdateProfileInputDto } from '../../dtos/update/update-profile-input.dto';
import { UpdateProfileResponseDto } from '../../dtos/update/update-profile-response.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Resolver()
export class UpdateProfileResolver {
  constructor(private readonly updateProfileService: UpdateProfileService) { }

  @Mutation(() => UpdateProfileResponseDto)
  async updateMyProfile(
    @CurrentUser() user: any,
    @Args('input') input: UpdateProfileInputDto,
  ): Promise<UpdateProfileResponseDto> {
    return this.updateProfileService.execute(user.idUsers, input);
  }
}