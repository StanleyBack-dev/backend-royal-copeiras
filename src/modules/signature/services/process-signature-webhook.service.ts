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

  private getString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value : undefined;
  }

  private resolveEventTimestamp(
    payload: Record<string, unknown>,
    objectPayload?: Record<string, unknown>,
    subjectPayload?: Record<string, unknown>,
  ): Date | undefined {
    const candidates = [
      this.getString(objectPayload?.["updated_at"]),
      this.getString(objectPayload?.["completed_at"]),
      this.getString(payload["updated_at"]),
      this.getString(payload["completed_at"]),
      this.getString(payload["completedAt"]),
      this.getString(payload["created_at"]),
      this.getString(subjectPayload?.["updated_at"]),
      this.getString(subjectPayload?.["completed_at"]),
    ];

    for (const candidate of candidates) {
      if (!candidate) continue;
      const parsed = new Date(candidate);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return undefined;
  }

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

  async execute(payload: unknown): Promise<void> {
    const p = (payload as Record<string, unknown>) ?? {};
    const originPayload = p["origin"] as Record<string, unknown> | undefined;
    const signerIp =
      typeof originPayload?.["ip"] === "string"
        ? originPayload["ip"]
        : undefined;
    const signerUserAgent =
      typeof originPayload?.["user-agent"] === "string"
        ? originPayload["user-agent"].slice(0, 255)
        : typeof originPayload?.["user_agent"] === "string"
          ? originPayload["user_agent"].slice(0, 255)
          : undefined;

    const objectPayload = (p["object"] ?? p["objeto"]) as
      | Record<string, unknown>
      | undefined;

    const assignment = (objectPayload?.["assignment"] ??
      objectPayload?.["atribuição"]) as Record<string, unknown> | undefined;
    const assignmentItems = Array.isArray(assignment?.["items"])
      ? (assignment!["items"] as Record<string, unknown>[])
      : [];

    const envelopeId =
      typeof objectPayload?.["id"] === "string"
        ? objectPayload["id"]
        : typeof p["requestId"] === "string"
          ? (p["requestId"] as string)
          : typeof p["request_id"] === "string"
            ? (p["request_id"] as string)
            : undefined;

    if (!envelopeId) {
      this.logger.warn("Webhook payload missing envelope/request id");
      return;
    }

    const eventId =
      typeof p["id"] === "number"
        ? String(p["id"])
        : typeof p["id"] === "string"
          ? p["id"]
          : undefined;

    const subjectPayload = p["subject"] as Record<string, unknown> | undefined;
    const subjectSignerId =
      typeof subjectPayload?.["id"] === "string"
        ? subjectPayload["id"]
        : undefined;
    const payloadSignerId =
      this.getString(p["signerId"]) ??
      this.getString(p["signer_id"]) ??
      this.getString(
        (p["signer"] as Record<string, unknown> | undefined)?.["id"],
      );
    const eventAt = this.resolveEventTimestamp(
      p,
      objectPayload,
      subjectPayload,
    );

    const allEnvelopeSignatures = await this.signaturesRepository.find({
      where: { envelopeId },
    });

    if (!allEnvelopeSignatures.length) {
      this.logger.debug(
        `No signature records found for envelopeId=${envelopeId}`,
      );
      return;
    }

    if (eventId) {
      const alreadyAll = allEnvelopeSignatures.every(
        (m) => m.providerEventId === eventId,
      );
      if (alreadyAll) {
        this.logger.debug(
          `Event ${eventId} already fully processed for envelope ${envelopeId}`,
        );
        return;
      }
    }

    const toUpdate: SignatureEntity[] = [];

    if (assignmentItems.length > 0) {
      for (const item of assignmentItems) {
        const signer = item["signer"] as Record<string, unknown> | undefined;
        const signerId =
          typeof signer?.["id"] === "string" ? signer["id"] : undefined;
        const acceptedTerms = signer?.["has_accepted_terms"] === true;
        const completed = item["completed"] === true;
        const value =
          typeof item["value"] === "string" ? item["value"].toUpperCase() : "";
        const isSigned = completed || value === "SIGNED";

        if (!signerId) continue;

        const record = allEnvelopeSignatures.find(
          (s) => s.providerSignerId === signerId,
        );
        if (!record) continue;

        if (isSigned) {
          record.status = SignatureStatus.SIGNED;
          if (!record.signedAt) {
            record.signedAt = eventAt ?? new Date();
          }
        }
        if (acceptedTerms && eventAt && !record.consentAt) {
          record.consentAt = eventAt;
        }
        if (subjectSignerId && signerId === subjectSignerId) {
          if (signerIp) record.signerIp = signerIp;
          if (signerUserAgent) record.signerUserAgent = signerUserAgent;
        }
        if (eventId) record.providerEventId = eventId;
        if (typeof signer?.["email"] === "string")
          record.signedByEmail = signer["email"];
        if (typeof signer?.["full_name"] === "string")
          record.signedByName = signer["full_name"];

        toUpdate.push(record);
      }
    }

    if (toUpdate.length === 0) {
      const eventName =
        typeof p["event"] === "string" ? p["event"].toLowerCase() : "";
      const acceptedTerms = subjectPayload?.["has_accepted_terms"] === true;
      const isSigned =
        eventName.includes("sign") || eventName.includes("assinad");

      const targetSignerId = subjectSignerId ?? payloadSignerId;
      const target = targetSignerId
        ? allEnvelopeSignatures.find(
            (s) => s.providerSignerId === targetSignerId,
          )
        : undefined;

      if (!target) {
        this.logger.warn(
          `Skipping broad signature update for envelopeId=${envelopeId}: signer target not identified`,
        );
      }

      for (const record of target ? [target] : []) {
        if (isSigned) {
          record.status = SignatureStatus.SIGNED;
          if (!record.signedAt) {
            record.signedAt = eventAt ?? new Date();
          }
        }
        if (acceptedTerms && eventAt && !record.consentAt) {
          record.consentAt = eventAt;
        }
        if (target) {
          if (signerIp) record.signerIp = signerIp;
          if (signerUserAgent) record.signerUserAgent = signerUserAgent;
        }
        if (eventId) record.providerEventId = eventId;
        toUpdate.push(record);
      }
    }

    if (toUpdate.length === 0) {
      this.logger.debug(`No records to update for envelopeId=${envelopeId}`);
      return;
    }

    await this.signaturesRepository.save(toUpdate);
    this.logger.log(
      `Updated ${toUpdate.length} signature record(s) for envelopeId=${envelopeId}`,
    );

    const contractId = allEnvelopeSignatures[0].idContracts;
    if (!contractId) return;

    const allContractSigs = await this.signaturesRepository.find({
      where: { idContracts: contractId },
    });
    const nextContractStatus =
      this.resolveContractStatusFromSignatures(allContractSigs);

    await this.contractsRepository.manager.transaction(async (manager) => {
      const contract = await manager.findOne(ContractsEntity, {
        where: { idContracts: contractId },
      });
      if (!contract) return;

      if (contract.status !== nextContractStatus) {
        contract.status = nextContractStatus;
        await manager.save(ContractsEntity, contract);
        this.logger.log(
          `Contract ${contractId} status updated to ${nextContractStatus}`,
        );
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
