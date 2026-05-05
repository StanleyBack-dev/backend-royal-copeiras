import { ProcessSignatureWebhookService } from "../process-signature-webhook.service";
import { Repository } from "typeorm";
import { SignatureEntity } from "../../entities/signature.entity";
import { ContractsEntity } from "../../../contracts/entities/contracts.entity";
import { SignatureStatus } from "../../enums/signature-status.enum";

describe("ProcessSignatureWebhookService", () => {
  it("returns gracefully when payload lacks envelope id", async () => {
    const mockSigRepo1 = { find: jest.fn() };
    const mockContractsRepo1 = { manager: { transaction: jest.fn() } };
    const mockActivationService1 = { execute: jest.fn() };

    const svc = new ProcessSignatureWebhookService(
      mockSigRepo1 as unknown as Repository<SignatureEntity>,
      mockContractsRepo1 as unknown as Repository<ContractsEntity>,
      mockActivationService1 as never,
    );

    await expect(svc.execute({})).resolves.toBeUndefined();
  });

  it("updates signatures and marks contract signed when all signed", async () => {
    const signature: Partial<SignatureEntity> = {
      idSignatures: "s1",
      idContracts: "c1",
      envelopeId: "env1",
      providerSignerId: "p1",
      signerIndex: 0,
      status: SignatureStatus.PENDING,
    };

    const mockSignaturesRepo = {
      find: jest
        .fn()
        .mockResolvedValueOnce([signature])
        .mockResolvedValueOnce([signature, { ...signature, status: "SIGNED" }]),
      save: jest.fn().mockResolvedValue(true),
    } as unknown as Repository<SignatureEntity>;

    // contracts repo mock not used in the first test path

    const mockManager = {
      findOne: jest
        .fn()
        .mockResolvedValue({ idContracts: "c1", status: "generated" }),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockContractsRepo2 = {
      manager: {
        transaction: jest
          .fn()
          .mockImplementation(
            async (cb: (m: typeof mockManager) => Promise<unknown>) => {
              return cb(mockManager);
            },
          ),
      },
    } as unknown as Repository<ContractsEntity>;
    const mockActivationService2 = { execute: jest.fn() };

    const svc2 = new ProcessSignatureWebhookService(
      mockSignaturesRepo as unknown as Repository<SignatureEntity>,
      mockContractsRepo2,
      mockActivationService2 as never,
    );

    await expect(
      svc2.execute({
        requestId: "env1",
        signerId: "p1",
        status: "signed",
        completedAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();

    const saveMock = (mockSignaturesRepo as unknown as { save: jest.Mock })
      .save;
    const txMock = (
      mockContractsRepo2 as unknown as { manager: { transaction: jest.Mock } }
    ).manager.transaction;

    expect(saveMock).toHaveBeenCalled();
    expect(txMock).toHaveBeenCalled();
  });

  it("updates only target signer in fallback path", async () => {
    const sig1: Partial<SignatureEntity> = {
      idSignatures: "s1",
      idContracts: "c1",
      envelopeId: "env-fallback",
      providerSignerId: "signer-1",
      status: SignatureStatus.PENDING,
    };
    const sig2: Partial<SignatureEntity> = {
      idSignatures: "s2",
      idContracts: "c1",
      envelopeId: "env-fallback",
      providerSignerId: "signer-2",
      status: SignatureStatus.PENDING,
    };

    const mockSignaturesRepo = {
      find: jest
        .fn()
        .mockResolvedValueOnce([sig1, sig2])
        .mockResolvedValueOnce([sig1, sig2]),
      save: jest.fn().mockResolvedValue(true),
    } as unknown as Repository<SignatureEntity>;

    const mockManager = {
      findOne: jest
        .fn()
        .mockResolvedValue({ idContracts: "c1", status: "generated" }),
      save: jest.fn().mockResolvedValue(true),
    };

    const mockContractsRepo = {
      manager: {
        transaction: jest
          .fn()
          .mockImplementation(
            async (cb: (m: typeof mockManager) => Promise<unknown>) => {
              return cb(mockManager);
            },
          ),
      },
    } as unknown as Repository<ContractsEntity>;

    const svc = new ProcessSignatureWebhookService(
      mockSignaturesRepo,
      mockContractsRepo,
      { execute: jest.fn() } as never,
    );

    await expect(
      svc.execute({
        requestId: "env-fallback",
        event: "signature.signed",
        signerId: "signer-2",
      }),
    ).resolves.toBeUndefined();

    const saveArg = (
      (mockSignaturesRepo as unknown as { save: jest.Mock }).save.mock
        .calls[0][0] as SignatureEntity[]
    )[0];

    expect(
      (mockSignaturesRepo as unknown as { save: jest.Mock }).save,
    ).toHaveBeenCalledTimes(1);
    expect(Array.isArray(saveArg ? [saveArg] : [])).toBe(true);
    expect(saveArg.providerSignerId).toBe("signer-2");
    expect(saveArg.status).toBe(SignatureStatus.SIGNED);
    expect(saveArg.signedAt).toBeInstanceOf(Date);
  });

  it("does not update all signers when target signer is missing", async () => {
    const sig1: Partial<SignatureEntity> = {
      idSignatures: "s1",
      idContracts: "c1",
      envelopeId: "env-no-target",
      providerSignerId: "signer-1",
      status: SignatureStatus.PENDING,
    };
    const sig2: Partial<SignatureEntity> = {
      idSignatures: "s2",
      idContracts: "c1",
      envelopeId: "env-no-target",
      providerSignerId: "signer-2",
      status: SignatureStatus.PENDING,
    };

    const mockSignaturesRepo = {
      find: jest.fn().mockResolvedValueOnce([sig1, sig2]),
      save: jest.fn().mockResolvedValue(true),
    } as unknown as Repository<SignatureEntity>;

    const mockContractsRepo = {
      manager: { transaction: jest.fn() },
    } as unknown as Repository<ContractsEntity>;

    const svc = new ProcessSignatureWebhookService(
      mockSignaturesRepo,
      mockContractsRepo,
      { execute: jest.fn() } as never,
    );

    await expect(
      svc.execute({
        requestId: "env-no-target",
        event: "signature.signed",
      }),
    ).resolves.toBeUndefined();

    expect(
      (mockSignaturesRepo as unknown as { save: jest.Mock }).save,
    ).not.toHaveBeenCalled();
  });
});
