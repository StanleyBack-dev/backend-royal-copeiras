import { Resolver, Query, Args } from '@nestjs/graphql';
import { GetProfileService } from '../../services/get/get-profile.service';
import { GetProfileInputDto } from '../../dtos/get/get-profile-input.dto';
import { GetProfileResponseDto } from '../../dtos/get/get-profile-response.dto';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Resolver()
export class GetProfileResolver {
  constructor(private readonly getProfileService: GetProfileService) { }

  @Query(() => GetProfileResponseDto)
  async getMyProfile(
    @CurrentUser() user: any,
  ): Promise<GetProfileResponseDto> {
    return this.getProfileService.findByUser(user.idUsers);
  }

  @Query(() => GetProfileResponseDto)
  async getProfile(
    @Args('input') input: GetProfileInputDto,
  ): Promise<GetProfileResponseDto> {
    return this.getProfileService.findOne(input);
  }
}