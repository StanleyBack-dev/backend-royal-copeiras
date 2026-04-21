import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { AuthPermission } from "../../auth/enums/auth-permission.enum";
import { RequirePermissions } from "../../auth/decorators/require-permissions.decorator";
import { RESPONSE_MESSAGES } from "../../../common/responses/catalogs/response-messages.catalog";
import {
  buildPaginatedListResponse,
  buildDataResponse,
  buildSuccessResponse,
} from "../../../common/responses/helpers/response.helper";
import { SuccessResponseDto } from "../../../common/responses/dtos/success-response.dto";
import { CancelSignatureRequestInputDto } from "../dtos/cancel-signature-request-input.dto";
import { CreateSignatureRequestInputDto } from "../dtos/create-signature-request-input.dto";
import { CreateSignatureRequestMutationResponseDto } from "../dtos/create-signature-request-mutation-response.dto";
import { GetSignatureStatusInputDto } from "../dtos/get-signature-status-input.dto";
import { GetSignatureStatusMutationResponseDto } from "../dtos/get-signature-status-mutation-response.dto";
import { CancelSignatureRequestService } from "../services/cancel-signature-request.service";
import { CreateSignatureRequestService } from "../services/create-signature-request.service";
import { GetSignatureStatusService } from "../services/get-signature-status.service";
import { GetSignaturesInputDto } from "../dtos/get-signatures-input.dto";
import { GetSignaturesListResponseDto } from "../dtos/get-signatures-list-response.dto";
import { GetSignaturesService } from "../services/get-signatures.service";

@Resolver(() => CreateSignatureRequestMutationResponseDto)
export class SignatureResolver {
  constructor(
    private readonly createSignatureRequestService: CreateSignatureRequestService,
    private readonly getSignatureStatusService: GetSignatureStatusService,
    private readonly cancelSignatureRequestService: CancelSignatureRequestService,
    private readonly getSignaturesService: GetSignaturesService,
  ) {}

  @Query(() => GetSignaturesListResponseDto, { name: "getSignatures" })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getSignatures(
    @CurrentUser() user: unknown,
    @Args("input", { nullable: true }) input?: GetSignaturesInputDto,
  ) {
    const signatures = await this.getSignaturesService.findAll(
      (user as { idUsers: string }).idUsers,
      input,
    );

    return buildPaginatedListResponse(
      signatures,
      RESPONSE_MESSAGES.signatures.listed,
    );
  }

  @Mutation(() => CreateSignatureRequestMutationResponseDto, {
    name: "createSignatureRequest",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async createSignatureRequest(
    @Args("input") input: CreateSignatureRequestInputDto,
  ) {
    const data = await this.createSignatureRequestService.execute(input);
    return buildDataResponse(data, RESPONSE_MESSAGES.signatures.requestCreated);
  }

  @Mutation(() => GetSignatureStatusMutationResponseDto, {
    name: "getSignatureStatus",
  })
  @RequirePermissions(AuthPermission.READ_BUDGETS)
  async getSignatureStatus(@Args("input") input: GetSignatureStatusInputDto) {
    const data = await this.getSignatureStatusService.execute(input.requestId);
    return buildDataResponse(data, RESPONSE_MESSAGES.signatures.statusFetched);
  }

  @Mutation(() => SuccessResponseDto, {
    name: "cancelSignatureRequest",
  })
  @RequirePermissions(AuthPermission.MANAGE_BUDGETS)
  async cancelSignatureRequest(
    @Args("input") input: CancelSignatureRequestInputDto,
  ) {
    await this.cancelSignatureRequestService.execute(input.requestId);
    return buildSuccessResponse(RESPONSE_MESSAGES.signatures.cancelled);
  }
}
