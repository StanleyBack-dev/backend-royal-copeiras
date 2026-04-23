import { ProcessSignatureWebhookService } from "../process-signature-webhook.service";

describe("ProcessSignatureWebhookService", () => {
  it("returns gracefully when payload lacks envelope id", async () => {
    const svc = new ProcessSignatureWebhookService(
      // @ts-expect-error partial mock
      { find: jest.fn() },
      // @ts-expect-error partial mock
      { manager: { transaction: jest.fn() } },
    );

    await expect(svc.execute({})).resolves.toBeUndefined();
  });

  it("updates signatures and marks contract signed when all signed", async () => {
    const signature = {
      idSignatures: "s1",
      idContracts: "c1",
      envelopeId: "env1",
      providerSignerId: "p1",
      signerIndex: 0,
      status: "PENDING",
    } as any;

    const signaturesRepo: any = {
      find: jest
        .fn()
        .mockResolvedValueOnce([signature])
        .mockResolvedValueOnce([signature, { ...signature, status: "SIGNED" }]),
      save: jest.fn().mockResolvedValue(true),
    };

    const contractsRepo: any = {
      manager: {
        transaction: jest.fn().mockImplementation(async (cb: any) => {
          const manager = {
            findOne: jest
              .fn()
              .mockResolvedValue({ idContracts: "c1", status: "generated" }),
            save: jest.fn().mockResolvedValue(true),
          };
          return cb(manager);
        }),
      },
    };

    const svc = new ProcessSignatureWebhookService(
      signaturesRepo,
      contractsRepo,
    );

    await expect(
      svc.execute({
        requestId: "env1",
        signerId: "p1",
        status: "signed",
        completedAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();

    expect(signaturesRepo.save).toHaveBeenCalled();
    expect(contractsRepo.manager.transaction).toHaveBeenCalled();
  });
});
