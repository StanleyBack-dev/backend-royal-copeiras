import { SignatureSignerInputDto } from "../dtos/signature-signer-input.dto";
import { SignatureStatus } from "../enums/signature-status.enum";

export interface CreateSignatureRequestCommand {
  documentName: string;
  documentBase64: string;
  externalReference?: string;
  signers: SignatureSignerInputDto[];
}

export interface SignatureRequestResult {
  requestId: string;
  status: SignatureStatus;
  providerRawStatus: string;
  signatureUrl?: string;
  signingUrls?: Array<{ signerId?: string; url?: string }>;
}

export interface SignatureStatusResult extends SignatureRequestResult {
  completedAt?: string;
}

export interface ISignatureProvider {
  createRequest(
    command: CreateSignatureRequestCommand,
  ): Promise<SignatureRequestResult>;
  getRequestStatus(requestId: string): Promise<SignatureStatusResult>;
  cancelRequest(requestId: string): Promise<void>;
}
