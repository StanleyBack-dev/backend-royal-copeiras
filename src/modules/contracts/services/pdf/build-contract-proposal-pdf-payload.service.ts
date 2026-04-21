import { Injectable } from "@nestjs/common";
import { ContractPdfPayload } from "../../../pdf-generator/templates/contracts/interfaces/contract-pdf-payload.interface";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatLongDateBR,
} from "../../../../utils/pdf";
import { formatContractDateOnly } from "../../utils/contract-date.util";

function splitBodyIntoParagraphs(body?: string): string[] {
  if (!body) {
    return [];
  }

  return body
    .split(/\r?\n\s*\r?\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildEventDatesText(eventDates: string[]): string {
  if (!eventDates.length) {
    return "a definir";
  }

  if (eventDates.length === 1) {
    return `no dia ${formatDateBR(eventDates[0])}`;
  }

  return eventDates
    .map((eventDate, index) => {
      const prefix = index === 0 ? "no dia" : "e no dia";
      return `${prefix} ${formatDateBR(eventDate)}`;
    })
    .join(", ");
}

function buildDefaultBody(snapshot: ContractPdfSnapshot): string {
  const eventDatesText = buildEventDatesText(snapshot.budget?.eventDates || []);
  const eventHours =
    snapshot.budget?.durationHours && snapshot.budget.durationHours > 0
      ? String(snapshot.budget.durationHours).padStart(2, "0")
      : "08";
  const totalAmountLabel =
    typeof snapshot.budget?.totalAmount === "number"
      ? formatCurrencyBRL(snapshot.budget.totalAmount)
      : "R$ 0,00";
  const advancePercentage =
    typeof snapshot.budget?.advancePercentage === "number"
      ? snapshot.budget.advancePercentage
      : 30;

  return `CLAUSULA 1a - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada consistentes na disponibilização de 1 - serviço, cuja função será zelar pela organização e limpeza de todo o salão, auditório e toaletes do evento, pelo período de ${eventHours} horas consecutivas.
1.2. O evento está previsto para ocorrer ${eventDatesText}.

CLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:

2.1. O valor dos serviços prestados é de ${totalAmountLabel}.
2.2. O pagamento deverá ser realizado à vista, via pix (CNPJ 64.062.038/0001-71) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento.

CLAUSULA 3a - RESPONSABILIDADES DO CONTRATANTE:

3.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços.

CLAUSULA 4a - RESPONSABILIDADES DA CONTRATADA:

4.1. A Royal Copeiras compromete-se a prestar os serviços contratados com equipe qualificada.

CLAUSULA 5a - CANCELAMENTO E REEMBOLSO:

5.1. O contratante poderá cancelar o serviço a qualquer momento, desde que o faça com pelo menos 5 dias de antecedência.

CLAUSULA 6a - ALTERAÇÕES CONTRATUAIS (ADENDOS E ADITIVOS):

6.1. Este contrato poderá sofrer alterações mediante comum acordo entre as partes.

CLAUSULA 7a - VIGÊNCIA:

7.1. O presente contrato tem início na data de sua assinatura e terá vigência até a conclusão das obrigações previstas neste instrumento.

CLAUSULA 8a - CONDIÇÕES GERAIS:

8.1. O contratante declara que todas as suas dúvidas foram devidamente esclarecidas.


DISPOSIÇÕES FINAIS:

Para quaisquer dúvidas ou maiores esclarecimentos, estamos à disposição.

Atenciosamente,
Equipe Royal Copeiras`;
}

@Injectable()
export class BuildContractProposalPdfPayloadService {
  build(
    snapshot: ContractPdfSnapshot,
    snapshotHash: string,
  ): ContractPdfPayload {
    const now = new Date();
    const contractorName = snapshot.lead?.name || "Contratante";
    const issueDate =
      snapshot.contract.issueDate || formatContractDateOnly(now);
    const validUntil = snapshot.contract.validUntil
      ? formatDateBR(snapshot.contract.validUntil)
      : "Nao informado";
    const bodyText = snapshot.contract.body || buildDefaultBody(snapshot);
    const objectParagraphs = splitBodyIntoParagraphs(bodyText);
    const clauses: string[] = [];

    return {
      companyName: "Royal Copeiras",
      companySubtitle:
        "Serviços de copeiragem e apoio para eventos sofisticados",
      documentTitle: "Contrato de Prestação de Serviços",
      documentSubtitle: "Instrumento particular",
      logoPlaceholderLabel: "Logo",
      metadata: [
        { label: "Contrato", value: snapshot.contract.contractNumber },
        { label: "Orçamento", value: snapshot.contract.budgetNumber },
        { label: "Emitido em", value: formatDateBR(issueDate) },
        { label: "Válido até", value: validUntil },
      ],
      parties: [
        {
          role: "Contratante",
          name: contractorName,
          document: snapshot.lead?.document,
          email: snapshot.lead?.email,
          phone: snapshot.lead?.phone,
        },
        {
          role: "Contratada",
          name: "Royal Copeiras",
          document: "64.062.038/0001-71",
          email: "royalcopeiras@gmail.com",
        },
      ],
      objectParagraphs,
      clauses,
      footer: {
        cityAndIssueDate: `Goiânia, ${formatLongDateBR(now)}`,
        legalNotice:
          "Este contrato reflete o acordo entre as partes para a prestação dos serviços especificados, com validade jurídica após aceite e assinatura.",
      },
      referenceCode: snapshotHash,
    };
  }
}
