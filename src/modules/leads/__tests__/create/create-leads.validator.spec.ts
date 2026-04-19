import { CreateLeadsInputDto } from "../../dtos/create/create-leads-input.dto";
import { LeadSource } from "../../enums/lead-source.enum";
import { LeadStatus } from "../../enums/lead-status.enum";

describe("CreateLeadsInputDto", () => {
  it("should require name", () => {
    const input = new CreateLeadsInputDto();
    expect(input.name).toBeUndefined();
  });

  it("should allow optional fields", () => {
    const input = new CreateLeadsInputDto();
    input.name = "Lead Exemplo";
    input.email = "lead@exemplo.com";
    input.phone = "62999990000";
    input.document = "12345678901";
    input.source = LeadSource.INSTAGRAM;
    input.notes = "observacao";
    input.status = LeadStatus.NEW;
    input.isActive = true;

    expect(input.name).toBe("Lead Exemplo");
    expect(input.status).toBe(LeadStatus.NEW);
    expect(input.isActive).toBe(true);
  });
});
