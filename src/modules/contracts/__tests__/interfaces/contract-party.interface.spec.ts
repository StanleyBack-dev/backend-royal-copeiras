import {
  buildContractPartyLines,
  resolveContractParty,
  sanitizeContractParty,
} from "../../interfaces/contract-party.interface";

describe("sanitizeContractParty", () => {
  it("returns an empty object for null/undefined input", () => {
    expect(sanitizeContractParty(undefined)).toEqual({});
    expect(sanitizeContractParty(null)).toEqual({});
  });

  it("trims values and drops empty/whitespace-only fields", () => {
    const result = sanitizeContractParty({
      legalName: "  Estevam Barros Rodrigues  ",
      tradeName: "   ",
      document: "",
    });

    expect(result).toEqual({ legalName: "Estevam Barros Rodrigues" });
  });

  it("ignores non-string values and unknown keys", () => {
    const result = sanitizeContractParty({
      legalName: "Royal",
      phone: 5599 as unknown as string,
      unknownKey: "value",
    } as Record<string, unknown>);

    expect(result).toEqual({ legalName: "Royal" });
  });
});

describe("resolveContractParty", () => {
  it("lets non-empty override values win over the base identity", () => {
    const result = resolveContractParty(
      { legalName: "Base Legal", tradeName: "Base Trade" },
      { tradeName: "Override Trade" },
    );

    expect(result).toEqual({
      legalName: "Base Legal",
      tradeName: "Override Trade",
    });
  });

  it("keeps the base value when the override field is empty", () => {
    const result = resolveContractParty(
      { tradeName: "Base Trade" },
      { tradeName: "   " },
    );

    expect(result).toEqual({ tradeName: "Base Trade" });
  });
});

describe("buildContractPartyLines", () => {
  it("builds the CONTRATADA identification block (name, CNPJ/IE and contact only)", () => {
    const lines = buildContractPartyLines({
      legalName: "Estevam Barros Rodrigues",
      tradeName: "Royal Copeiras",
      document: "64.062.038/0001-71",
      stateRegistration: "12345",
      address: "Rua das Copeiras, 10",
      addressCity: "Goiânia",
      addressState: "GO",
      addressZipCode: "74000-000",
      representativeName: "Estevam Barros",
      representativeRole: "Titular",
      representativeDocument: "000.000.000-00",
      email: "royalcopeiras@gmail.com",
      phone: "62999999999",
    });

    expect(lines).toEqual([
      "Razão Social: Estevam Barros Rodrigues",
      "Nome fantasia: Royal Copeiras",
      "CNPJ: 64.062.038/0001-71",
      "Inscrição Estadual: 12345",
      "E-mail: royalcopeiras@gmail.com",
      "Telefone: 62999999999",
    ]);
  });

  it("does not print address or representative rows", () => {
    const lines = buildContractPartyLines({
      legalName: "Royal Copeiras",
      address: "Rua X, 1",
      addressCity: "Goiânia",
      representativeName: "Fulano de Tal",
    });

    expect(lines).toEqual(["Razão Social: Royal Copeiras"]);
  });

  it("omits the trade name line when it matches the legal name", () => {
    const lines = buildContractPartyLines({
      legalName: "Royal Copeiras",
      tradeName: "royal copeiras",
    });

    expect(lines).toEqual(["Razão Social: Royal Copeiras"]);
  });

  it("returns an empty array for an empty party", () => {
    expect(buildContractPartyLines({})).toEqual([]);
  });
});
