import { BuildContractProposalPdfPayloadService } from "../../services/pdf/build-contract-proposal-pdf-payload.service";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractPartySnapshot } from "../../interfaces/contract-party.interface";

function buildSnapshot(
  contractor: ContractPartySnapshot,
  body = "Corpo do contrato de teste.",
): ContractPdfSnapshot {
  return {
    schemaVersion: "1.0.0",
    generatedAt: "2026-09-03T12:00:00.000Z",
    contract: {
      idContracts: "contract-1",
      idUsers: "user-1",
      idBudgets: "budget-1",
      budgetNumber: "ORC-0001",
      contractNumber: "CT-0001",
      status: ContractStatus.DRAFT,
      issueDate: "2026-09-03",
      body,
    },
    lead: { name: "Cliente Teste" },
    contractor,
  };
}

describe("BuildContractProposalPdfPayloadService", () => {
  const service = new BuildContractProposalPdfPayloadService();

  it("uses the contractor snapshot for the CONTRATADA block", () => {
    const payload = service.build(
      buildSnapshot({
        legalName: "Estevam Barros Rodrigues",
        tradeName: "Royal Copeiras",
        document: "64.062.038/0001-71",
        email: "royalcopeiras@gmail.com",
        issueCity: "Goiânia",
      }),
      "hash-123",
    );

    expect(payload.companyName).toBe("Royal Copeiras");

    const contratada = payload.parties.find((p) => p.role === "Contratada");
    expect(contratada?.name).toBe("Estevam Barros Rodrigues");
    expect(contratada?.document).toBe("64.062.038/0001-71");
    expect(contratada?.lines).toContain("CNPJ: 64.062.038/0001-71");
    expect(payload.footer.cityAndIssueDate.startsWith("Goiânia,")).toBe(true);
    expect(payload.referenceCode).toBe("hash-123");
  });

  it("falls back to the Royal Copeiras defaults when the contractor is empty", () => {
    const payload = service.build(buildSnapshot({}), "hash-456");

    expect(payload.companyName).toBe("Royal Copeiras");

    const contratada = payload.parties.find((p) => p.role === "Contratada");
    expect(contratada?.name).toBe("Royal Copeiras");
    expect(payload.footer.cityAndIssueDate.startsWith("Goiânia,")).toBe(true);
  });

  it("uses the address city for the issue city when issueCity is missing", () => {
    const payload = service.build(
      buildSnapshot({ tradeName: "Empresa X", addressCity: "Anápolis" }),
      "hash-789",
    );

    expect(payload.footer.cityAndIssueDate.startsWith("Anápolis,")).toBe(true);
  });
});
