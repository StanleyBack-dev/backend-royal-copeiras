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

    const completedAt =
      typeof objectPayload?.["updated_at"] === "string"
        ? objectPayload["updated_at"]
        : typeof p["created_at"] === "string"
          ? (p["created_at"] as string)
          : undefined;
    const eventAt = completedAt;
    const subjectPayload = p["subject"] as Record<string, unknown> | undefined;
    const subjectSignerId =
      typeof subjectPayload?.["id"] === "string"
        ? subjectPayload["id"]
        : undefined;

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
          if (completedAt && !record.signedAt) {
            record.signedAt = new Date(completedAt);
          }
        }
        if (acceptedTerms && eventAt && !record.consentAt) {
          record.consentAt = new Date(eventAt);
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

      const target = subjectSignerId
        ? allEnvelopeSignatures.find(
            (s) => s.providerSignerId === subjectSignerId,
          )
        : undefined;

      for (const record of target ? [target] : allEnvelopeSignatures) {
        if (isSigned) {
          record.status = SignatureStatus.SIGNED;
          if (completedAt && !record.signedAt) {
            record.signedAt = new Date(completedAt);
          }
        }
        if (acceptedTerms && eventAt && !record.consentAt) {
          record.consentAt = new Date(eventAt);
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
