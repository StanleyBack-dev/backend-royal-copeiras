import { BuildContractProposalPdfPayloadService } from "../../services/pdf/build-contract-proposal-pdf-payload.service";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractPartySnapshot } from "../../interfaces/contract-party.interface";

function buildSnapshot(
  contractor: ContractPartySnapshot,
  body = "Corpo do contrato de teste.",
  lead: ContractPdfSnapshot["lead"] = { name: "Cliente Teste" },
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
    lead,
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

  it("includes the PIX key owner's name next to the key in the default body", () => {
    const payload = service.build(
      buildSnapshot(
        {
          tradeName: "Royal Copeiras",
          pixKey: "64.062.038/0001-71",
          pixKeyType: "cnpj",
          representativeName: "Estevam Barros Rodrigues",
        },
        // no explicit body — forces the default-body payment clause to run
        "",
      ),
      "hash-pix",
    );

    const fullBody = payload.objectParagraphs.join("\n");
    expect(fullBody).toContain(
      "CNPJ 64.062.038/0001-71 - Estevam Barros Rodrigues",
    );
  });

  it("shows the PIX key holder name even when only the document is set", () => {
    const payload = service.build(
      buildSnapshot(
        {
          tradeName: "Royal Copeiras",
          document: "64.062.038/0001-71",
          legalName: "Estevam Barros Rodrigues",
        },
        "",
      ),
      "hash-doc-owner",
    );

    const fullBody = payload.objectParagraphs.join("\n");
    expect(fullBody).toContain(
      "CNPJ 64.062.038/0001-71 - Estevam Barros Rodrigues",
    );
  });

  it("uses the address city for the issue city when issueCity is missing", () => {
    const payload = service.build(
      buildSnapshot({ tradeName: "Empresa X", addressCity: "Anápolis" }),
      "hash-789",
    );

    expect(payload.footer.cityAndIssueDate.startsWith("Anápolis,")).toBe(true);
  });

  it("phrases material lines in Cláusula 3.2 as 'qtd unidade de nome'", () => {
    const snapshot = buildSnapshot({ tradeName: "Royal Copeiras" }, "");
    snapshot.budget = {
      eventDates: ["2026-10-01"],
      eventArrivalTimes: ["08:00"],
      eventDepartureTimes: ["18:00"],
      eventLocation: ["Salão"],
      guestCount: [50],
      durationHours: [8],
      totalAmount: 1000,
      items: [
        {
          itemType: "LABOR",
          serviceType: "Copeira",
          quantity: 2,
          description: "2 copeiras",
          eventDateIndex: 0,
        },
        {
          itemType: "SUPPLY",
          quantity: 4,
          description: "Papel higiênico",
          supplyName: "Papel higiênico",
          unit: "rolo",
          eventDateIndex: 0,
        },
        {
          itemType: "SUPPLY",
          quantity: 1,
          description: "Álcool em gel",
          supplyName: "Álcool em gel",
          unit: "caixa",
          eventDateIndex: 0,
        },
      ],
    };

    const payload = service.build(snapshot, "hash-supplies");
    const fullBody = payload.objectParagraphs.join("\n");

    expect(fullBody).toContain("4 (quatro) rolos de papel higiênico");
    expect(fullBody).toContain("1 (uma) caixa de álcool em gel");
  });

  it("breaks the displacement fee down per day on multi-day events", () => {
    const snapshot = buildSnapshot({ tradeName: "Royal Copeiras" }, "");
    snapshot.budget = {
      eventDates: ["2026-10-01", "2026-10-02"],
      eventArrivalTimes: ["08:00", "08:00"],
      eventDepartureTimes: ["18:00", "18:00"],
      eventLocation: ["Salão", "Salão"],
      guestCount: [50, 50],
      durationHours: [8, 8],
      displacementFee: [80, 50],
      totalAmount: 1130,
      items: [
        {
          itemType: "LABOR",
          serviceType: "Copeira",
          quantity: 2,
          description: "2 copeiras",
          eventDateIndex: 0,
        },
      ],
    };

    const fullBody = service
      .build(snapshot, "hash-disp")
      .objectParagraphs.join("\n");

    const normalized = fullBody.replace(/\u00A0/g, " ");
    expect(normalized).toContain(
      "taxa de deslocamento no valor total de R$ 130,00 (cento e trinta reais), sendo R$ 80,00 (oitenta reais) referente ao 1º dia, R$ 50,00 (cinquenta reais) referente ao 2º dia",
    );
    // clause 1.4 must appear exactly once (no leftover hardcoded duplicate)
    expect(fullBody.match(/\n1\.4\./g) || []).toHaveLength(1);
  });

  it("includes the CONTRATADA penalty clause referencing clauses 5.1 a 5.3 in the default body", () => {
    const payload = service.build(
      buildSnapshot({ tradeName: "Royal Copeiras" }, ""),
      "hash-penalty",
    );

    const fullBody = payload.objectParagraphs.join("\n");
    expect(fullBody).toContain(
      "5.5. Em caso de descumprimento, pela CONTRATADA, das obrigações previstas nas Cláusulas 5.1 a 5.3",
    );
    expect(fullBody).toContain("multa de 10% (dez por cento)");
  });

  it("fully qualifies the CONTRATANTE block when the lead has a razão social and address", () => {
    const payload = service.build(
      buildSnapshot(
        { tradeName: "Royal Copeiras" },
        "Corpo do contrato de teste.",
        {
          name: "Fulano",
          document: "12345678000199",
          legalName: "Multicanal Atacado Ltda",
          address: "Av. Central, 100",
          addressCity: "Goiânia",
          addressState: "GO",
          addressZipCode: "74000-000",
          email: "contato@multicanal.com",
          phone: "62999990000",
        },
      ),
      "hash-contratante",
    );

    const contratante = payload.parties.find((p) => p.role === "Contratante");
    expect(contratante?.lines).toContain(
      "Razão Social: Multicanal Atacado Ltda",
    );
    expect(contratante?.lines).toContain("CNPJ: 12345678000199");
    expect(contratante?.lines).toContain(
      "Endereço: Av. Central, 100 - Goiânia/GO - CEP 74000-000",
    );
  });

  it("composes the CONTRATANTE address from the structured lead fields", () => {
    const payload = service.build(
      buildSnapshot(
        { tradeName: "Royal Copeiras" },
        "Corpo do contrato de teste.",
        {
          name: "Fulano",
          document: "12345678000199",
          addressStreet: "Rua 6",
          addressNumber: "SN",
          addressComplement: "Quadra 22 Lote 03",
          addressNeighborhood: "Polo Empresarial Goiás",
          addressCity: "Aparecida de Goiânia",
          addressState: "GO",
          addressZipCode: "74985-105",
        },
      ),
      "hash-structured-address",
    );

    const contratante = payload.parties.find((p) => p.role === "Contratante");
    expect(contratante?.lines).toContain(
      "Endereço: Rua 6, SN, Quadra 22 Lote 03, Polo Empresarial Goiás - Aparecida de Goiânia/GO - CEP 74985-105",
    );
  });

  it("falls back to the legacy free-text address when the lead has no structured street", () => {
    const payload = service.build(
      buildSnapshot(
        { tradeName: "Royal Copeiras" },
        "Corpo do contrato de teste.",
        {
          name: "Fulano",
          address: "Av. Central, 100",
          addressCity: "Goiânia",
          addressState: "GO",
        },
      ),
      "hash-legacy-address",
    );

    const contratante = payload.parties.find((p) => p.role === "Contratante");
    expect(contratante?.lines).toContain(
      "Endereço: Av. Central, 100 - Goiânia/GO",
    );
  });

  it("keeps the default CONTRATANTE rendering when the lead has no razão social or address", () => {
    const payload = service.build(
      buildSnapshot({ tradeName: "Royal Copeiras" }, "Corpo de teste.", {
        name: "Fulano",
        document: "12345678901",
      }),
      "hash-contratante-default",
    );

    const contratante = payload.parties.find((p) => p.role === "Contratante");
    expect(contratante?.lines).toEqual([]);
  });
});
