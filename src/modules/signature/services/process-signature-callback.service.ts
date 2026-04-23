import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignatureEntity } from "../entities/signature.entity";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { UserEntity } from "../../users/entities/user.entity";
import { LeadsEntity } from "../../leads/entities/leads.entity";
import { SignatureStatus } from "../enums/signature-status.enum";
import { ContractStatus } from "../../contracts/enums/contract-status.enum";

type WebhookPayload = {
  id?: string;
  data?: Record<string, unknown>;
  documentId?: string;
  envelopeId?: string;
  status?: string;
  state?: string;
  updated_at?: string;
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
  ) {}

  private mapSignatureToContractStatus(status: SignatureStatus) {
    switch (status) {
      case SignatureStatus.SIGNED:
        return ContractStatus.SIGNED;
      case SignatureStatus.REJECTED:
        return ContractStatus.REJECTED;
      case SignatureStatus.CANCELLED:
        return ContractStatus.CANCELED;
      case SignatureStatus.EXPIRED:
        return ContractStatus.EXPIRED;
      case SignatureStatus.DRAFT:
      case SignatureStatus.PENDING:
      default:
        return ContractStatus.PENDING_SIGNATURE;
    }
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

    const existing = await this.signaturesRepository.findOne({
      where: { envelopeId },
    });

    if (!existing) return { handled: false };

    existing.status = signatureStatus;
    if (getString(payload?.updated_at)) {
      existing.signedAt = new Date(getString(payload?.updated_at)!);
    } else if (getString(payload?.data?.updated_at)) {
      existing.signedAt = new Date(getString(payload.data!.updated_at)!);
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

    // update contract status accordingly
    const nextContractStatus = this.mapSignatureToContractStatus(
      existing.status,
    );
    await this.contractsRepository.update(
      { idContracts: existing.idContracts },
      { status: nextContractStatus },
    );

    return { handled: true };
  }
}
