/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { ProcessSignatureCallbackService } from "../services/process-signature-callback.service";
import { SignatureStatus } from "../enums/signature-status.enum";
import { ContractStatus } from "../../contracts/enums/contract-status.enum";

describe("ProcessSignatureCallbackService", () => {
  let service: ProcessSignatureCallbackService;
  let signaturesRepository: any;
  let contractsRepository: any;

  beforeEach(() => {
    signaturesRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    contractsRepository = {
      update: jest.fn(),
    };

    // @ts-ignore - inject mocks
    service = new ProcessSignatureCallbackService(
      signaturesRepository,
      contractsRepository,
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

    signaturesRepository.findOne.mockResolvedValue(existing);
    signaturesRepository.save.mockImplementation(async (v: any) => v);

    const payload = {
      id: "env-1",
      status: "signed",
      updated_at: "2026-04-22T10:00:00.000Z",
      signer: { name: "Fulano", email: "fulano@example.com" },
      signatureUrl: "https://assinafy/sign/123",
    };

    const result = await service.processAssinafyCallback(payload);

    expect(signaturesRepository.findOne).toHaveBeenCalledWith({
      where: { envelopeId: "env-1" },
    });
    expect(signaturesRepository.save).toHaveBeenCalled();
    expect(contractsRepository.update).toHaveBeenCalledWith(
      { idContracts: existing.idContracts },
      { status: ContractStatus.SIGNED },
    );
    expect(result.handled).toBe(true);
  });

  it("returns handled false when signature not found", async () => {
    signaturesRepository.findOne.mockResolvedValue(null);
    const payload = { id: "unknown", status: "signed" };
    const result = await service.processAssinafyCallback(payload);
    expect(result.handled).toBe(false);
  });
});
