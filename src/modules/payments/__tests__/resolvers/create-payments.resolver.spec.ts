import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { CreatePaymentInputDto } from "../../dtos/create/create-payment-input.dto";
import { PaymentOrigin } from "../../enums/payment-origin.enum";
import { CreatePaymentsResolver } from "../../resolvers/create/create-payments.resolver";
import { CreatePaymentsService } from "../../services/create/create-payments.service";

describe("CreatePaymentsResolver", () => {
  it("should call service with current user id", async () => {
    const createPaymentsService = {
      execute: jest.fn().mockResolvedValue({ idPayments: "payment-1" }),
    } as unknown as CreatePaymentsService;

    const resolver = new CreatePaymentsResolver(createPaymentsService);

    const user = { idUsers: "user-1" } as AuthenticatedUser;
    const input = {
      idLeads: "lead-1",
      origin: PaymentOrigin.BUDGET_ADVANCE,
      plannedAmount: 50,
    } as CreatePaymentInputDto;

    const result = await resolver.createPayment(user, input);

    expect(createPaymentsService.execute).toHaveBeenCalledWith("user-1", input);
    expect(result.idPayments).toBe("payment-1");
  });
});
