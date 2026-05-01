/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { ProcessSignatureCallbackService } from "../services/process-signature-callback.service";
import { SignatureStatus } from "../enums/signature-status.enum";

describe("ProcessSignatureCallbackService", () => {
  let service: ProcessSignatureCallbackService;
  let signaturesRepository: any;
  let contractsRepository: any;
  let usersRepository: any;
  let leadsRepository: any;
  let activateSignedContractService: any;

  beforeEach(() => {
    signaturesRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    contractsRepository = {
      manager: {
        transaction: jest.fn().mockImplementation(async (cb: any) => {
          const contractRepo = {
            findOne: jest
              .fn()
              .mockResolvedValue({ idContracts: "ctr-1", status: "generated" }),
            save: jest.fn().mockResolvedValue(true),
          };
          const manager = {
            getRepository: jest.fn().mockReturnValue(contractRepo),
          };
          return cb(manager);
        }),
      },
    };

    usersRepository = { findOne: jest.fn() };
    leadsRepository = { findOne: jest.fn() };
    activateSignedContractService = { execute: jest.fn() };

    // @ts-ignore - inject mocks
    service = new ProcessSignatureCallbackService(
      signaturesRepository,
      contractsRepository,
      usersRepository,
      leadsRepository,
      activateSignedContractService,
    );
  });

  it("updates signature and contract when payload indicates signed", async () => {
    const existing = {
      idSignatures: "sig-1",
      envelopeId: "env-1",
      idContracts: "ctr-1",
      status: SignatureStatus.PENDING,
      signedAt: undefined,
      signedByName: undefined,
      signedByEmail: undefined,
      signatureUrl: undefined,
    };

    signaturesRepository.find
      .mockResolvedValueOnce([existing])
      .mockResolvedValueOnce([{ ...existing, status: SignatureStatus.SIGNED }]);
    signaturesRepository.save.mockImplementation(async (v: any) => v);

    const payload = {
      id: "env-1",
      status: "signed",
      updated_at: "2026-04-22T10:00:00.000Z",
      signer: { name: "Fulano", email: "fulano@example.com" },
      signatureUrl: "https://assinafy/sign/123",
    };

    const result = await service.processAssinafyCallback(payload);

    expect(signaturesRepository.find).toHaveBeenCalled();
    expect(signaturesRepository.save).toHaveBeenCalled();
    expect(contractsRepository.manager.transaction).toHaveBeenCalled();
    expect(result.handled).toBe(true);
  });

  it("returns handled false when signature not found", async () => {
    signaturesRepository.find.mockResolvedValue([]);
    const payload = { id: "unknown", status: "signed" };
    const result = await service.processAssinafyCallback(payload);
    expect(result.handled).toBe(false);
  });
});
