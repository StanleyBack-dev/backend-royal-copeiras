import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignatureEntity } from "../entities/signature.entity";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { SignatureStatus } from "../enums/signature-status.enum";
import { ContractStatus } from "../../contracts/enums/contract-status.enum";

@Injectable()
export class ProcessSignatureWebhookService {
  private readonly logger = new Logger(ProcessSignatureWebhookService.name);

  constructor(
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
  ) {}

  private mapProviderStatus(providerStatus?: string): SignatureStatus {
    if (!providerStatus) return SignatureStatus.UNKNOWN;
    const s = providerStatus.toLowerCase();
    if (s.includes("sign")) return SignatureStatus.SIGNED;
    if (s.includes("pending") || s.includes("created") || s.includes("waiting"))
      return SignatureStatus.PENDING;
    if (s.includes("cancel")) return SignatureStatus.CANCELLED;
    if (s.includes("reject")) return SignatureStatus.REJECTED;
    if (s.includes("expire")) return SignatureStatus.EXPIRED;
    if (s.includes("draft")) return SignatureStatus.DRAFT;
    return SignatureStatus.UNKNOWN;
  }

  async execute(payload: any): Promise<void> {
    const eventId =
      payload.eventId ?? payload.id ?? payload.event_id ?? undefined;
    const envelopeId =
      payload.requestId ??
      payload.request_id ??
      payload.envelopeId ??
      payload.envelope_id;
    const providerSignerId =
      payload.signerId ?? payload.signer_id ?? payload.signer?.id ?? undefined;
    const signerIndex =
      payload.signerIndex ?? payload.signer_index ?? undefined;
    const providerStatus = this.mapProviderStatus(
      payload.status ?? payload.state ?? payload.event,
    );
    const signatureUrl = payload.signatureUrl ?? payload.url ?? undefined;
    const completedAt =
      payload.completedAt ??
      payload.completed_at ??
      payload.signedAt ??
      undefined;

    if (!envelopeId) {
      this.logger.warn("Webhook payload missing envelope/request id");
      return;
    }

    let matches: SignatureEntity[] = [];

    if (providerSignerId) {
      matches = await this.signaturesRepository.find({
        where: { envelopeId, providerSignerId },
      });
    }

    if ((!matches || matches.length === 0) && signerIndex !== undefined) {
      matches = await this.signaturesRepository.find({
        where: { envelopeId, signerIndex },
      });
    }

    if (!matches || matches.length === 0) {
      matches = await this.signaturesRepository.find({
        where: { envelopeId },
      });
    }

    if (!matches || matches.length === 0) {
      this.logger.debug(
        `No signature records found for envelopeId=${envelopeId}`,
      );
      return;
    }

    // idempotency: if event already applied to any of the matched rows, skip
    if (eventId) {
      const already = matches.find((m) => m.providerEventId === eventId);
      if (already) {
        this.logger.debug(
          `Event ${eventId} already processed for envelope ${envelopeId}`,
        );
        return;
      }
    }

    // update matched signatures
    const updated = matches.map((m) => {
      m.status = providerStatus;
      m.signatureUrl = signatureUrl ?? m.signatureUrl;
      m.signedAt = completedAt ? new Date(completedAt) : m.signedAt;
      if (eventId) m.providerEventId = eventId;
      return m;
    });

    await this.signaturesRepository.save(updated);

    // Check contract status: if ALL signatures for same contract are SIGNED -> update contract
    const contractId = matches[0].idContracts;
    if (!contractId) return;

    const allSigs = await this.signaturesRepository.find({
      where: { idContracts: contractId },
    });
    const everySigned =
      allSigs.length > 0 &&
      allSigs.every((s) => s.status === SignatureStatus.SIGNED);

    if (!everySigned) return;

    // update contract status inside a transaction using repo.manager.transaction
    await this.contractsRepository.manager.transaction(async (manager) => {
      const contract = await manager.findOne(ContractsEntity, {
        where: { idContracts: contractId },
      });
      if (!contract) return;
      if (contract.status === ContractStatus.SIGNED) return;
      contract.status = ContractStatus.SIGNED;
      await manager.save(ContractsEntity, contract);
    });
  }
}
