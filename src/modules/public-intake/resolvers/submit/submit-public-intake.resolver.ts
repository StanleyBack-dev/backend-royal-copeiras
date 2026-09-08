import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { Public } from "../../../../common/decorators/public.decorator";
import { RESPONSE_MESSAGES } from "../../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../../common/responses/helpers/response.helper";
import { SubmitPublicIntakeInputDto } from "../../dtos/submit/submit-public-intake-input.dto";
import { SubmitPublicIntakeMutationResponseDto } from "../../dtos/submit/submit-public-intake-mutation-response.dto";
import { SubmitPublicIntakeService } from "../../services/submit/submit-public-intake.service";

@Resolver()
export class SubmitPublicIntakeResolver {
  constructor(
    private readonly submitPublicIntakeService: SubmitPublicIntakeService,
  ) {}

  @Public()
  @Mutation(() => SubmitPublicIntakeMutationResponseDto, {
    name: "submitPublicIntake",
  })
  async submitPublicIntake(@Args("input") input: SubmitPublicIntakeInputDto) {
    const submitted = await this.submitPublicIntakeService.execute(input);

    return buildDataResponse(
      submitted,
      RESPONSE_MESSAGES.publicIntake.submitted,
    );
  }
}
