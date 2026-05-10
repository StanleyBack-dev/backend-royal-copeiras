import { createListResponseDto } from "../../../../common/responses/factories/create-list-response.dto";
import { GetPaymentResponseDto } from "./get-payment-response.dto";

export const GetPaymentsListResponseDto = createListResponseDto(
  GetPaymentResponseDto,
  "GetPaymentsListResponseDto",
);
