import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "../../../../common/decorators/public.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { VerifyPublicIntakeCodeInputDto } from "../../dtos/verify/verify-public-intake-code-input.dto";
import { VerifyPublicIntakeCodeMutationResponseDto } from "../../dtos/verify/verify-public-intake-code-mutation-response.dto";
import { VerifyPublicIntakeCodeService } from "../../services/verify/verify-public-intake-code.service";

@Resolver()
export class VerifyPublicIntakeCodeResolver {
  constructor(
    private readonly verifyPublicIntakeCodeService: VerifyPublicIntakeCodeService,
  ) {}

  @Public()
  @Mutation(() => VerifyPublicIntakeCodeMutationResponseDto, {
    name: "verifyPublicIntakeCode",
  })
  async verifyPublicIntakeCode(
    @Args("input") input: VerifyPublicIntakeCodeInputDto,
  ) {
    const verified = await this.verifyPublicIntakeCodeService.execute(
      input.code,
    );

    return buildDataResponse(
      verified,
      RESPONSE_MESSAGES.publicIntake.codeVerified,
    );
  }
}
