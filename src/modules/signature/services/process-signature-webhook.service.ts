import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SignatureEntity } from "../entities/signature.entity";
import { ContractsEntity } from "../../contracts/entities/contracts.entity";
import { SignatureStatus } from "../enums/signature-status.enum";
import { ContractStatus } from "../../contracts/enums/contract-status.enum";
import { ActivateSignedContractService } from "./activate-signed-contract.service";

@Injectable()
export class ProcessSignatureWebhookService {
  private readonly logger = new Logger(ProcessSignatureWebhookService.name);

  constructor(
    @InjectRepository(SignatureEntity)
    private readonly signaturesRepository: Repository<SignatureEntity>,
    @InjectRepository(ContractsEntity)
    private readonly contractsRepository: Repository<ContractsEntity>,
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

  private mapProviderStatus(providerStatus?: string): SignatureStatus {
    if (!providerStatus) return SignatureStatus.UNKNOWN;
    const s = providerStatus.toLowerCase();
    if (s.includes("sign") || s.includes("assinad"))
      return SignatureStatus.SIGNED;
    if (s.includes("pending") || s.includes("created") || s.includes("waiting"))
      return SignatureStatus.PENDING;
    if (s.includes("pendente")) return SignatureStatus.PENDING;
    if (s.includes("cancel")) return SignatureStatus.CANCELLED;
    if (s.includes("reject") || s.includes("recus"))
      return SignatureStatus.REJECTED;
    if (s.includes("expire")) return SignatureStatus.EXPIRED;
    if (s.includes("expir")) return SignatureStatus.EXPIRED;
    if (s.includes("draft")) return SignatureStatus.DRAFT;
    if (s.includes("rascunho")) return SignatureStatus.DRAFT;
    return SignatureStatus.UNKNOWN;
  }

  async execute(payload: unknown): Promise<void> {
    const p = (payload as Record<string, unknown>) ?? {};
    const objectPayload =
      (p["object"] as Record<string, unknown> | undefined) ||
      (p["objeto"] as Record<string, unknown> | undefined);
    const subjectPayload =
      (p["subject"] as Record<string, unknown> | undefined) ||
      (p["assunto"] as Record<string, unknown> | undefined);

    const toStringOrUndefined = (value: unknown): string | undefined => {
      if (typeof value === "string") return value;
      if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
      }
      return undefined;
    };

    const eventId =
      typeof p["eventId"] === "string"
        ? (p["eventId"] as string)
        : typeof p["id"] === "string"
          ? (p["id"] as string)
          : typeof p["id"] === "number"
            ? String(p["id"])
          : typeof p["event_id"] === "string"
            ? (p["event_id"] as string)
            : undefined;
    const envelopeId =
      toStringOrUndefined(p["requestId"]) ||
      toStringOrUndefined(p["request_id"]) ||
      toStringOrUndefined(p["envelopeId"]) ||
      toStringOrUndefined(p["envelope_id"]) ||
      toStringOrUndefined(objectPayload?.["id"]) ||
      toStringOrUndefined(p["documentId"]);

    const signerObj =
      (p["signer"] as Record<string, unknown> | undefined) ||
      (objectPayload?.["signer"] as Record<string, unknown> | undefined);
    const providerSignerId =
      (typeof p["signerId"] === "string"
        ? (p["signerId"] as string)
        : undefined) ??
      (typeof p["signer_id"] === "string"
        ? (p["signer_id"] as string)
        : undefined) ??
      (typeof signerObj === "object" &&
      signerObj &&
      typeof signerObj["id"] === "string"
        ? (signerObj["id"] as string)
        : undefined) ??
      (typeof subjectPayload?.["id"] === "string"
        ? (subjectPayload["id"] as string)
        : undefined);

    const signerIndexRaw = p["signerIndex"] ?? p["signer_index"];
    const signerIndex =
      typeof signerIndexRaw === "number"
        ? signerIndexRaw
        : typeof signerIndexRaw === "string" && /^[0-9]+$/.test(signerIndexRaw)
          ? Number(signerIndexRaw)
          : undefined;

    const statusRaw =
      p["status"] ??
      p["state"] ??
      p["event"] ??
      p["evento"] ??
      objectPayload?.["status"] ??
      objectPayload?.["state"];
    const providerStatus =
      typeof statusRaw === "string"
        ? this.mapProviderStatus(statusRaw)
        : this.mapProviderStatus(undefined);

    const signatureUrl =
      typeof p["signatureUrl"] === "string"
        ? (p["signatureUrl"] as string)
        : typeof p["url"] === "string"
          ? (p["url"] as string)
          : typeof p["signing_url"] === "string"
            ? (p["signing_url"] as string)
            : typeof objectPayload?.["signing_url"] === "string"
              ? (objectPayload["signing_url"] as string)
          : undefined;
    const completedAt =
      typeof
        (p["completedAt"] ??
          p["completed_at"] ??
          p["signedAt"] ??
          p["updated_at"] ??
          objectPayload?.["updated_at"] ??
          objectPayload?.["updatedAt"])
        === "string"
        ? ((p["completedAt"] ??
            p["completed_at"] ??
            p["signedAt"] ??
            p["updated_at"] ??
            objectPayload?.["updated_at"] ??
            objectPayload?.["updatedAt"]) as string)
        : undefined;

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
      if (providerStatus === SignatureStatus.SIGNED && completedAt) {
        m.signedAt = new Date(completedAt);
      }
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
    const nextContractStatus =
      this.resolveContractStatusFromSignatures(allSigs);

    // update contract status inside a transaction using repo.manager.transaction
    await this.contractsRepository.manager.transaction(async (manager) => {
      const contract = await manager.findOne(ContractsEntity, {
        where: { idContracts: contractId },
      });
      if (!contract) return;

      if (contract.status !== nextContractStatus) {
        contract.status = nextContractStatus;
        await manager.save(ContractsEntity, contract);
      }

      if (nextContractStatus === ContractStatus.SIGNED) {
        await this.activateSignedContractService.execute(
          contract.idContracts,
          manager,
        );
      }
    });
  }
}
