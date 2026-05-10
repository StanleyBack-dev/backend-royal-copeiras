import type { AuthenticatedUser } from "../../../auth/interfaces/auth-token-payload.interface";
import { GetPaymentsResolver } from "../../resolvers/get/get-payments.resolver";
import { GetPaymentsService } from "../../services/get/get-payments.service";

describe("GetPaymentsResolver", () => {
  function makeResolver() {
    const getPaymentsService = {
      getById: jest.fn().mockResolvedValue({ idPayments: "payment-1" }),
      getByBudget: jest.fn().mockResolvedValue([{ idPayments: "payment-1" }]),
      getByContract: jest.fn().mockResolvedValue([{ idPayments: "payment-1" }]),
      getByLead: jest.fn().mockResolvedValue([{ idPayments: "payment-1" }]),
    } as unknown as GetPaymentsService;

    return {
      resolver: new GetPaymentsResolver(getPaymentsService),
      getPaymentsService,
    };
  }

  const user = { idUsers: "user-1" } as AuthenticatedUser;

  it("should call getById with user id", async () => {
    const { resolver, getPaymentsService } = makeResolver();

    await resolver.getPayment(user, "payment-1");

    expect(getPaymentsService.getById).toHaveBeenCalledWith(
      "user-1",
      "payment-1",
    );
  });

  it("should call getByBudget with user id", async () => {
    const { resolver, getPaymentsService } = makeResolver();

    await resolver.getPaymentsByBudget(user, "budget-1");

    expect(getPaymentsService.getByBudget).toHaveBeenCalledWith(
      "user-1",
      "budget-1",
    );
  });

  it("should call getByContract with user id", async () => {
    const { resolver, getPaymentsService } = makeResolver();

    await resolver.getPaymentsByContract(user, "contract-1");

    expect(getPaymentsService.getByContract).toHaveBeenCalledWith(
      "user-1",
      "contract-1",
    );
  });

  it("should call getByLead with user id", async () => {
    const { resolver, getPaymentsService } = makeResolver();

    await resolver.getPaymentsByLead(user, "lead-1");

    expect(getPaymentsService.getByLead).toHaveBeenCalledWith(
      "user-1",
      "lead-1",
    );
  });
});
