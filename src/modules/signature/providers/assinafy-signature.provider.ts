import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import {
  CreateSignatureRequestCommand,
  ISignatureProvider,
  SignatureRequestResult,
  SignatureStatusResult,
} from "../contracts/signature-provider.contract";
import { SignatureStatus } from "../enums/signature-status.enum";

interface AssinafyCreateResponse {
  id?: string;
  status?: string;
  assignment?: {
    id?: string;
    signing_urls?: Array<{ signer_id?: string; url?: string }>;
  } | null;
  updated_at?: string;
}

interface AssinafySignerResponse {
  status?: number;
  message?: string;
  data?: {
    id?: string;
    email?: string;
  };
  id?: string;
  email?: string;
}

interface AssinafySignerListResponse {
  status?: number;
  message?: string;
  data?: Array<{
    id?: string;
    email?: string;
  }>;
}

interface AssinafyUploadResponse {
  apiStatus?: number;
  message?: string;
  data?: {
    id?: string;
    status?: string;
    assignment?: unknown;
    updated_at?: string;
  };
  id?: string;
  status?: string;
  assignment?: unknown;
  updated_at?: string;
}

interface AssinafyAssignmentResponse {
  status?: number;
  message?: string;
  data?: {
    id?: string;
    signing_urls?: Array<{ signer_id?: string; url?: string }>;
  };
  id?: string;
  signing_urls?: Array<{ signer_id?: string; url?: string }>;
}

@Injectable()
export class AssinafySignatureProvider implements ISignatureProvider {
  private readonly logger = new Logger(AssinafySignatureProvider.name);
  private readonly baseUrl: string;
  private readonly accountId?: string;
  private readonly apiKey?: string;
  private readonly apiToken?: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = (
      this.configService.get<string>("ASSINAFY_BASE_URL") || ""
    ).replace(/\/+$/, "");
    this.accountId = this.configService.get<string>("ASSINAFY_ACCOUNT_ID");
    this.apiKey = this.configService.get<string>("ASSINAFY_API_KEY");
    this.apiToken = this.configService.get<string>("ASSINAFY_API_TOKEN");
    this.timeoutMs =
      this.configService.get<number>("ASSINAFY_TIMEOUT_MS") ?? 15000;
  }

  async createRequest(
    command: CreateSignatureRequestCommand,
  ): Promise<SignatureRequestResult> {
    this.ensureConfiguration();

    const documentId = await this.uploadDocument(
      command.documentName,
      command.documentBase64,
    );
    await this.waitForDocumentReady(documentId);
    const signerIds = await Promise.all(
      command.signers.map((signer) =>
        this.ensureSigner({
          full_name: signer.name,
          email: signer.email,
          phone: signer.phone,
        }),
      ),
    );

    const assignment = await this.createAssignment(documentId, signerIds);
    const signatureUrl = assignment.signing_urls?.[0]?.url;

    if (!signatureUrl) {
      this.logger.warn("Assignment criado sem signing URL", {
        documentId,
        assignmentId: assignment.id,
      });
    }

    return {
      requestId: documentId,
      status: SignatureStatus.PENDING,
      providerRawStatus: "pending_signature",
      signatureUrl,
      signingUrls: Array.isArray(assignment.signing_urls)
        ? assignment.signing_urls.map((s) => ({
            signerId: s.signer_id,
            url: s.url,
          }))
        : [],
    };
  }

  async getRequestStatus(requestId: string): Promise<SignatureStatusResult> {
    this.ensureConfiguration();

    const data = await this.request<AssinafyCreateResponse>(
      `/documents/${requestId}`,
      {
        method: "GET",
      },
    );

    if (!data?.id) {
      throw AppException.from(APP_ERRORS.signatures.requestNotFound, undefined);
    }

    const normalizedStatus = String(data.status || "").toLowerCase();
    const completedAt =
      normalizedStatus === "signed" || normalizedStatus === "completed"
        ? data.updated_at
        : undefined;

    return {
      requestId: data.id,
      status: this.mapStatus(data.status),
      providerRawStatus: data.status || "unknown",
      signatureUrl: undefined,
      completedAt,
    };
  }

  async cancelRequest(requestId: string): Promise<void> {
    this.ensureConfiguration();

    await this.request(`/documents/${requestId}`, { method: "DELETE" });
  }

  private ensureConfiguration(): void {
    if (!this.baseUrl || (!this.apiKey && !this.apiToken) || !this.accountId) {
      throw AppException.from(
        APP_ERRORS.signatures.integrationNotConfigured,
        undefined,
      );
    }
  }

  private mapStatus(status?: string): SignatureStatus {
    switch ((status || "").toLowerCase()) {
      case "draft":
        return SignatureStatus.DRAFT;
      case "pending":
      case "in_progress":
      case "pending_signature":
      case "pending_signatures":
        return SignatureStatus.PENDING;
      case "signed":
      case "completed":
        return SignatureStatus.SIGNED;
      case "rejected":
      case "declined":
        return SignatureStatus.REJECTED;
      case "cancelled":
      case "canceled":
        return SignatureStatus.CANCELLED;
      case "expired":
        return SignatureStatus.EXPIRED;
      default:
        return SignatureStatus.UNKNOWN;
    }
  }

  private async uploadDocument(
    name: string,
    base64Content: string,
  ): Promise<string> {
    const buffer = Buffer.from(base64Content, "base64");
    const blob = new Blob([buffer], { type: "application/pdf" });
    const formData = new FormData();
    formData.append("file", blob, name);

    const response = await this.request<AssinafyUploadResponse>(
      `/accounts/${this.accountId}/documents`,
      {
        method: "POST",
        body: formData,
        headers: {},
      },
    );

    const documentId = response?.id || response?.data?.id;
    if (!documentId) {
      this.logger.error("Upload Assinafy sem ID de documento", {
        response,
      });
      throw AppException.from(
        APP_ERRORS.signatures.providerRequestFailed,
        undefined,
      );
    }

    return documentId;
  }

  private async ensureSigner(input: {
    full_name: string;
    email: string;
    phone?: string;
  }): Promise<string> {
    try {
      const response = await this.request<AssinafySignerResponse>(
        `/accounts/${this.accountId}/signers`,
        {
          method: "POST",
          body: JSON.stringify({
            full_name: input.full_name,
            email: input.email,
            phone: input.phone,
          }),
        },
      );

      const signerId = response?.data?.id || response?.id;
      if (!signerId) {
        this.logger.error("Criacao de signer sem ID na resposta", {
          response,
          signerEmail: input.email,
        });
        throw AppException.from(
          APP_ERRORS.signatures.providerRequestFailed,
          undefined,
        );
      }

      return signerId;
    } catch (error) {
      if (!(error instanceof AppException)) {
        throw error;
      }

      const response = error.getResponse();
      const details =
        typeof response === "object" &&
        response !== null &&
        "details" in response
          ? (response as { details?: { responseBody?: string } }).details
          : undefined;
      const responseBody = String(details?.responseBody || "").toLowerCase();
      const signerAlreadyExists =
        responseBody.includes("signatário com este e-mail já existe") ||
        responseBody.includes("signatario com este e-mail ja existe");

      if (!signerAlreadyExists) {
        throw error;
      }

      const existingSignerId = await this.findSignerIdByEmail(input.email);
      if (!existingSignerId) {
        throw error;
      }

      this.logger.debug("Signatario existente reaproveitado", {
        email: input.email,
        signerId: existingSignerId,
      });

      return existingSignerId;
    }
  }

  private async createAssignment(
    documentId: string,
    signerIds: string[],
  ): Promise<{
    id?: string;
    signing_urls?: Array<{ signer_id?: string; url?: string }>;
  }> {
    const maxAttempts = 6;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const response = await this.request<AssinafyAssignmentResponse>(
          `/documents/${documentId}/assignments`,
          {
            method: "POST",
            body: JSON.stringify({
              method: "virtual",
              signerIds,
            }),
          },
        );

        const data = response?.data
          ? response.data
          : {
              id: response?.id,
              signing_urls: response?.signing_urls,
            };
        if (!data?.id) {
          this.logger.error("Criacao de assignment sem ID na resposta", {
            response,
            documentId,
            signerIds,
          });
          throw AppException.from(
            APP_ERRORS.signatures.providerRequestFailed,
            undefined,
          );
        }

        return data;
      } catch (error) {
        lastError = error;
        if (!(error instanceof AppException)) {
          throw error;
        }

        const response = error.getResponse();
        const details =
          typeof response === "object" &&
          response !== null &&
          "details" in response
            ? (response as { details?: { responseBody?: string } }).details
            : undefined;
        const responseBody = String(details?.responseBody || "").toLowerCase();
        const isMetadataProcessing = responseBody.includes(
          "metadata_processing",
        );
        const isLastAttempt = attempt >= maxAttempts - 1;

        if (!isMetadataProcessing || isLastAttempt) {
          throw error;
        }

        await this.wait(1200 * (attempt + 1));
      }
    }

    throw (
      lastError ||
      AppException.from(APP_ERRORS.signatures.providerRequestFailed, undefined)
    );
  }

  private async waitForDocumentReady(documentId: string): Promise<void> {
    const maxAttempts = 8;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const payload = await this.request<AssinafyCreateResponse>(
        `/documents/${documentId}`,
        {
          method: "GET",
        },
      );
      const status = String(payload?.status || "").toLowerCase();
      if (status && status !== "metadata_processing") {
        return;
      }
      await this.wait(900 + attempt * 400);
    }
  }

  private async wait(ms: number): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private async findSignerIdByEmail(email: string): Promise<string | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const queryEmail = encodeURIComponent(normalizedEmail);
    const response = await this.request<AssinafySignerListResponse>(
      `/accounts/${this.accountId}/signers?search=${queryEmail}&page=1&per-page=20`,
      {
        method: "GET",
      },
    );

    const items = Array.isArray(response?.data) ? response.data : [];
    const match = items.find(
      (item) => (item?.email || "").trim().toLowerCase() === normalizedEmail,
    );

    return match?.id || null;
  }

  private async request<T = unknown>(
    path: string,
    init: RequestInit,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const resolvedHeaders: Record<string, string> = {
        ...(this.apiToken ? { Authorization: `Bearer ${this.apiToken}` } : {}),
        ...(this.apiKey ? { "X-Api-Key": this.apiKey } : {}),
        ...(init.headers ? (init.headers as Record<string, string>) : {}),
      };

      const hasFormDataBody = init.body instanceof FormData;

      if (!hasFormDataBody) {
        resolvedHeaders["Content-Type"] =
          resolvedHeaders["Content-Type"] || "application/json";
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          ...resolvedHeaders,
        },
      });

      if (!response.ok) {
        const responseBody = await response.text();
        this.logger.error(
          `Erro Assinafy [${response.status}] ${responseBody || "<sem body>"}`,
        );

        if (response.status === 404) {
          throw AppException.from(
            APP_ERRORS.signatures.requestNotFound,
            undefined,
            {
              status: response.status,
              path,
              responseBody,
            },
          );
        }

        throw AppException.from(
          APP_ERRORS.signatures.providerRequestFailed,
          undefined,
          {
            status: response.status,
            path,
            responseBody,
          },
        );
      }

      if (response.status === 204) {
        return undefined as T;
      }

      const raw = (await response.json()) as T;
      this.logger.debug(`Assinafy sucesso [${response.status}] ${path}`);
      return raw;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      this.logger.error("Falha de comunicacao com Assinafy", error as Error);
      throw AppException.from(
        APP_ERRORS.signatures.providerRequestFailed,
        undefined,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
