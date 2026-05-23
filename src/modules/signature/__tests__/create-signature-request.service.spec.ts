import { CreateSignatureRequestService } from "../services/create-signature-request.service";
import type { ISignatureProvider } from "../contracts/signature-provider.contract";
import type { Repository } from "typeorm";
import { SignatureEntity } from "../entities/signature.entity";
import type { CreateSignatureRequestInputDto } from "../dtos/create-signature-request-input.dto";

describe("CreateSignatureRequestService (idempotency)", () => {
  it("does not create duplicate signature rows when existing records match", async () => {
    const providerResponse = {
      requestId: "env-123",
      status: "pending",
      providerRawStatus: "pending",
      signatureUrl: "https://assinafy/sign/1",
      signingUrls: [
        { signerId: "s1", url: "https://assinafy/sign/1/s1" },
        { signerId: "s2", url: "https://assinafy/sign/1/s2" },
      ],
    };

    const signatureProvider: Partial<ISignatureProvider> = {
      createRequest: jest.fn().mockResolvedValue(providerResponse),
    };

    // simulate existing row for signer s1 (already created)
    const existingRows = [
      {
        idSignatures: "existing-1",
        providerSignerId: "s1",
        signedByEmail: "client@example.com",
        signerIndex: 0,
        idContracts: "c-1",
        envelopeId: "env-123",
      },
    ];

    const repo: Partial<Repository<SignatureEntity>> = {
      find: jest
        .fn()
        .mockResolvedValue(
          existingRows,
        ) as unknown as Repository<SignatureEntity>["find"],
      create: ((
        payload: Partial<SignatureEntity> | Partial<SignatureEntity>[],
      ): SignatureEntity | SignatureEntity[] => {
        if (Array.isArray(payload)) {
          return payload.map((p) => ({ ...p })) as SignatureEntity[];
        }
        return { ...payload } as SignatureEntity;
      }) as unknown as Repository<SignatureEntity>["create"],
      save: jest
        .fn()
        .mockResolvedValue(
          true,
        ) as unknown as Repository<SignatureEntity>["save"],
    };

    const svc = new CreateSignatureRequestService(
      signatureProvider as unknown as ISignatureProvider,
      repo as unknown as Repository<SignatureEntity>,
    );

    const input = {
      documentName: "doc.pdf",
      documentBase64: "YmFzZTY0",
      externalReference: "c-1",
      signers: [
        {
          name: "Client",
          email: "client@example.com",
          phone: "",
          identifier: "",
        },
        {
          name: "Company",
          email: "company@example.com",
          phone: "",
          identifier: "",
        },
      ],
    } as unknown as CreateSignatureRequestInputDto;

    await svc.execute(input);

    // repo.find should be called to discover existing
    expect(repo.find as unknown as jest.Mock).toHaveBeenCalledWith({
      where: { idContracts: "c-1", envelopeId: "env-123" },
    });

    // save should be called once for the missing signer (s2)
    const saveMock = repo.save as unknown as jest.Mock;
    expect(saveMock).toHaveBeenCalled();
    const savedArg = saveMock.mock.calls[0][0];
    // one entity created (for signer index 1)
    expect(Array.isArray(savedArg) ? savedArg.length : 1).toBe(1);
    expect(savedArg[0].providerSignerId).toBe("s2");
  });
});
