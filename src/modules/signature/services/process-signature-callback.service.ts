import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignatureEntity } from "../entities/signature.entity";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { SignatureStatus } from "../enums/signature-status.enum";
import { ContractStatus } from "../../contracts/enums/contract-status.enum";
import { ActivateSignedContractService } from "./activate-signed-contract.service";

type WebhookPayload = {
  id?: string;
  data?: Record<string, unknown>;
  documentId?: string;
  envelopeId?: string;
  status?: string;
  state?: string;
  updated_at?: string;
  completed_at?: string;
  signer?: {
    name?: string;
    email?: string;
    identifier?: string;
    ip?: string;
    userAgent?: string;
  };
  signerIp?: string;
  signerUserAgent?: string;
  consent_at?: string;
  signatureUrl?: string;
};

@Injectable()
export class ProcessSignatureCallbackService {
  constructor(
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(LeadsEntity)
    private readonly leadsRepository: Repository<LeadsEntity>,
    private readonly activateSignedContractService: ActivateSignedContractService,
  ) {}

  private resolveContractStatusFromSignatures(
    signatures: SignatureEntity[],
  ): ContractStatus {
    if (!signatures.length) {
      return ContractStatus.PENDING_SIGNATURE;
    }

    if (
      signatures.every(
        (signature) => signature.status === SignatureStatus.SIGNED,
      )
    ) {
      return ContractStatus.SIGNED;
    }

    if (
      signatures.some(
        (signature) => signature.status === SignatureStatus.REJECTED,
      )
    ) {
      return ContractStatus.REJECTED;
    }

    if (
      signatures.some(
        (signature) => signature.status === SignatureStatus.CANCELLED,
      )
    ) {
      return ContractStatus.CANCELED;
    }

    if (
      signatures.some(
        (signature) => signature.status === SignatureStatus.EXPIRED,
      )
    ) {
      return ContractStatus.EXPIRED;
    }

    return ContractStatus.PENDING_SIGNATURE;
  }

  async processAssinafyCallback(payload: WebhookPayload) {
    // payload may vary; try common paths for id/status
    const getString = (v: unknown): string | undefined =>
      typeof v === "string" ? v : undefined;
    const envelopeId =
      getString(payload?.id) ||
      getString(payload?.data?.id) ||
      getString(payload?.documentId) ||
      getString(payload?.envelopeId);
    const rawStatus =
      getString(payload?.status) ||
      getString(payload?.data?.status) ||
      getString(payload?.state) ||
      undefined;
    if (!envelopeId || !rawStatus) return { handled: false };

    const normalized = String(rawStatus).toLowerCase();

    // map to SignatureStatus enum where possible
    let signatureStatus: SignatureStatus = SignatureStatus.UNKNOWN;
    switch (normalized) {
      case "signed":
      case "completed":
        signatureStatus = SignatureStatus.SIGNED;
        break;
      case "rejected":
      case "declined":
        signatureStatus = SignatureStatus.REJECTED;
        break;
      case "cancelled":
      case "canceled":
        signatureStatus = SignatureStatus.CANCELLED;
        break;
      case "expired":
        signatureStatus = SignatureStatus.EXPIRED;
        break;
      case "pending":
      case "pending_signature":
      case "in_progress":
        signatureStatus = SignatureStatus.PENDING;
        break;
      case "draft":
        signatureStatus = SignatureStatus.DRAFT;
        break;
      default:
        signatureStatus = SignatureStatus.UNKNOWN;
    }

    const signatures = await this.signaturesRepository.find({
      where: { envelopeId },
    });

    if (!signatures.length) return { handled: false };

    const signerEmail = getString(payload?.signer?.email);
    const signerDocument = getString(payload?.signer?.identifier);

    const existingByEmail = signatures.find(
      (signature) =>
        Boolean(signerEmail) &&
        signature.signedByEmail?.toLowerCase() === signerEmail?.toLowerCase(),
    );
    const existingByDocument = signatures.find(
      (signature) =>
        Boolean(signerDocument) &&
        signature.signedByDocument === signerDocument,
    );
    const existing =
      existingByEmail ||
      existingByDocument ||
      (signatures.length === 1 ? signatures[0] : undefined);

    if (!existing) {
      return { handled: false };
    }

    existing.status = signatureStatus;
    if (signatureStatus === SignatureStatus.SIGNED) {
      if (getString(payload?.updated_at)) {
        existing.signedAt = new Date(getString(payload?.updated_at)!);
      } else if (getString(payload?.completed_at)) {
        existing.signedAt = new Date(getString(payload?.completed_at)!);
      } else if (getString(payload?.data?.updated_at)) {
        existing.signedAt = new Date(getString(payload.data!.updated_at)!);
      } else if (getString(payload?.data?.completed_at)) {
        existing.signedAt = new Date(getString(payload.data!.completed_at)!);
      } else {
        existing.signedAt = new Date();
      }
    }

    if (payload?.signer) {
      existing.signedByName = payload.signer.name || existing.signedByName;
      existing.signedByEmail = payload.signer.email || existing.signedByEmail;
      existing.signedByDocument =
        payload.signer.identifier || existing.signedByDocument;
    }

    // request-level metadata possibly attached by controller
    if (payload?.signerIp) {
      existing.signerIp = payload.signerIp;
    } else if (payload?.signer?.ip) {
      existing.signerIp = payload.signer.ip;
    }

    if (payload?.signerUserAgent) {
      existing.signerUserAgent = payload.signerUserAgent;
    } else if (payload?.signer?.userAgent) {
      existing.signerUserAgent = payload.signer.userAgent;
    }

    // consent timestamp
    if (getString(payload?.consent_at)) {
      existing.consentAt = new Date(getString(payload?.consent_at)!);
    } else if (getString(payload?.data?.consent_at)) {
      existing.consentAt = new Date(getString(payload.data!.consent_at)!);
    }

    // attempt to link to internal user by email; if not found, check leads
    if (existing.signedByEmail && !existing.idUsers) {
      try {
        const user = await this.usersRepository.findOne({
          where: { email: existing.signedByEmail },
        });
        if (user) {
          existing.idUsers = user.idUsers;
        } else {
          // try matching a lead by email; if found, associate signature to the lead's owning user
          const lead = await this.leadsRepository.findOne({
            where: { email: existing.signedByEmail },
          });
          if (lead) {
            existing.idUsers = lead.idUsers;
          }
        }
      } catch {
        void 0;
      }
    }

    const sigUrl =
      getString(payload?.signatureUrl) ||
      (payload.data &&
        getString((payload.data as Record<string, unknown>).signatureUrl));
    if (sigUrl) existing.signatureUrl = sigUrl;

    await this.signaturesRepository.save(existing);

    const signaturesByContract = await this.signaturesRepository.find({
      where: { idContracts: existing.idContracts },
    });

    const nextContractStatus =
      this.resolveContractStatusFromSignatures(signaturesByContract);

    await this.contractsRepository.manager.transaction(async (manager) => {
      const contractRepo = manager.getRepository(ContractsEntity);
      const contract = await contractRepo.findOne({
        where: { idContracts: existing.idContracts },
      });
      if (!contract) {
        return;
      }

      if (contract.status !== nextContractStatus) {
        contract.status = nextContractStatus;
        await contractRepo.save(contract);
      }

      if (nextContractStatus === ContractStatus.SIGNED) {
        await this.activateSignedContractService.execute(
          contract.idContracts,
          manager,
        );
      }
    });

    return { handled: true };
  }
}
