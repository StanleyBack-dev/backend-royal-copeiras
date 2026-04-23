import { ProcessSignatureWebhookService } from "../process-signature-webhook.service";
import { Repository } from "typeorm";

describe("ProcessSignatureWebhookService", () => {
  it("returns gracefully when payload lacks envelope id", async () => {
    const svc = new ProcessSignatureWebhookService(
      { find: jest.fn() } as unknown as Partial<Repository<Record<string, unknown>>>,
      ({ manager: { transaction: jest.fn() } } as unknown) as Partial<Repository<Record<string, unknown>>>,
    );

    await expect(svc.execute({})).resolves.toBeUndefined();
  });

  it("updates signatures and marks contract signed when all signed", async () => {
    const signature: Record<string, unknown> = {
      idSignatures: "s1",
      idContracts: "c1",
      envelopeId: "env1",
      providerSignerId: "p1",
      signerIndex: 0,
      status: "PENDING",
    };

    const signaturesRepo = {
      find: jest
        .fn()
        .mockResolvedValueOnce([signature])
        .mockResolvedValueOnce([signature, { ...signature, status: "SIGNED" }]),
      save: jest.fn().mockResolvedValue(true),
    } as unknown as Partial<Repository<Record<string, unknown>>>;

    const contractsRepo = ({
      manager: {
        transaction: jest.fn().mockImplementation(async (cb: unknown) => {
          const manager = {
            findOne: jest.fn().mockResolvedValue({ idContracts: "c1", status: "generated" }),
            save: jest.fn().mockResolvedValue(true),
          };
          return (cb as (m: unknown) => Promise<unknown>)(manager);
        }),
      },
    } as unknown) as Partial<Repository<Record<string, unknown>>>;

    const svc = new ProcessSignatureWebhookService(
      signaturesRepo as unknown as Repository<Record<string, unknown>>,
      contractsRepo as unknown as Repository<Record<string, unknown>>,
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
