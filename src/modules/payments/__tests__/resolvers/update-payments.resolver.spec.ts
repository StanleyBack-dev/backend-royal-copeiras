import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { UpdatePaymentInputDto } from "../../dtos/update/update-payment-input.dto";
import { PaymentStatus } from "../../enums/payment-status.enum";
import { UpdatePaymentsResolver } from "../../resolvers/update/update-payments.resolver";
import { UpdatePaymentsService } from "../../services/update/update-payments.service";

describe("UpdatePaymentsResolver", () => {
  it("should call service with current user id", async () => {
    const updatePaymentsService = {
      execute: jest.fn().mockResolvedValue({ idPayments: "payment-1" }),
    } as unknown as UpdatePaymentsService;

    const resolver = new UpdatePaymentsResolver(updatePaymentsService);

    const user = { idUsers: "user-1" } as AuthenticatedUser;
    const input = {
      idPayments: "payment-1",
      status: PaymentStatus.PAID,
      paidAmount: 100,
      paymentDate: "2026-05-09",
    } as UpdatePaymentInputDto;

    const result = await resolver.updatePayment(user, input);

    expect(updatePaymentsService.execute).toHaveBeenCalledWith("user-1", input);
    expect(result.idPayments).toBe("payment-1");
  });
});
