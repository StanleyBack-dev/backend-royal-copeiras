import { Injectable } from "@nestjs/common";
import { ContractPdfPayload } from "../../../pdf-generator/templates/contracts/interfaces/contract-pdf-payload.interface";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatLongDateBR,
} from "../../../../utils/pdf";
import { getFragmentForServiceType } from "../../constants/service-fragments";
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

function parseTimeToMinutes(time?: string): number | undefined {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return undefined;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function addOneDayIsoDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  parsed.setDate(parsed.getDate() + 1);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildEventScheduleText(
  eventDates: string[],
  arrivalTimes: string[],
  departureTimes: string[],
): string {
  const dayCount = Math.max(
    eventDates.length,
    arrivalTimes.length,
    departureTimes.length,
  );

  if (!dayCount) {
    return "com horários de chegada e partida a definir";
  }

  if (dayCount === 1) {
    const arrival = arrivalTimes[0] || "a definir";
    const departure = departureTimes[0] || "a definir";
    const arrivalMinutes = parseTimeToMinutes(arrival);
    const departureMinutes = parseTimeToMinutes(departure);
    const isNextDay =
      arrivalMinutes !== undefined &&
      departureMinutes !== undefined &&
      departureMinutes > 0 &&
      departureMinutes < arrivalMinutes;

    if (isNextDay && eventDates[0]) {
      return `com chegada às ${arrival} e saída em ${formatDateBR(addOneDayIsoDate(eventDates[0]))} (dia seguinte), às ${departure}`;
    }

    return `com chegada às ${arrival} e saída às ${departure}`;
  }

  const lines: string[] = [];
  for (let index = 0; index < dayCount; index += 1) {
    const dateLabel = eventDates[index]
      ? formatDateBR(eventDates[index])
      : `${index + 1}o dia`;
    const arrival = arrivalTimes[index] || "a definir";
    const departure = departureTimes[index] || "a definir";
    const arrivalMinutes = parseTimeToMinutes(arrival);
    const departureMinutes = parseTimeToMinutes(departure);
    const isNextDay =
      arrivalMinutes !== undefined &&
      departureMinutes !== undefined &&
      departureMinutes > 0 &&
      departureMinutes < arrivalMinutes;

    const departureDateLabel =
      isNextDay && eventDates[index]
        ? `${formatDateBR(addOneDayIsoDate(eventDates[index]))} (dia seguinte)`
        : dateLabel;

    if (departureDateLabel === dateLabel) {
      lines.push(
        `no dia ${dateLabel}, chegada às ${arrival} e saída às ${departure}`,
      );
      continue;
    }

    lines.push(
      `no dia ${dateLabel}, chegada às ${arrival} e saída em ${departureDateLabel}, às ${departure}`,
    );
  }

  return `com a seguinte programação: ${lines.join("; ")}`;
}

function buildDefaultBody(snapshot: ContractPdfSnapshot): string {
  const eventDatesText = buildEventDatesText(snapshot.budget?.eventDates || []);
  const eventScheduleText = buildEventScheduleText(
    snapshot.budget?.eventDates || [],
    snapshot.budget?.eventArrivalTimes || [],
    snapshot.budget?.eventDepartureTimes || [],
  );
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
  // choose primary service type from budget items (first defined)
  const primaryServiceType =
    snapshot.budget?.items && snapshot.budget.items.length
      ? String(snapshot.budget.items[0].serviceType || "").trim()
      : "";

  const fragment = getFragmentForServiceType(primaryServiceType);
  // build a services block listing each budget item as a separate line
  const items = snapshot.budget?.items || [];

  function numberToPtWords(n: number): string {
    const map: Record<number, string> = {
      0: "zero",
      1: "um",
      2: "dois",
      3: "três",
      4: "quatro",
      5: "cinco",
      6: "seis",
      7: "sete",
      8: "oito",
      9: "nove",
      10: "dez",
    };
    return map[n] || String(n);
  }

  const buildItemLine = (it: {
    serviceType?: string;
    quantity?: number;
    description?: string;
  }) => {
    const qty =
      it.quantity && Number.isFinite(it.quantity) && it.quantity > 0
        ? it.quantity
        : 1;
    const qtyWords = numberToPtWords(qty);
    const serviceLabel =
      (it.serviceType && String(it.serviceType).trim()) || "serviço";
    const lowerService = serviceLabel.toLowerCase();
    const rawDescription = String(it.description || "")
      .replace(/\r?\n+/g, " ")
      .trim();

    if (/^Prestação de serviço de/i.test(rawDescription)) {
      return rawDescription;
    }

    const descFragment =
      rawDescription || getFragmentForServiceType(it.serviceType) || fragment;

    return `Prestação de serviço de ${qty} (${qtyWords}) ${lowerService} para atuação durante o evento, com foco em ${descFragment}.`;
  };

  const servicesBlock = items.length
    ? items
        .map((item, index) => `1.1.${index + 1}. ${buildItemLine(item)}`)
        .join("\n")
    : `1.1.1. Prestação de serviço de 1 (um) serviço para atuação durante o evento, com foco em ${fragment}.`;

  const displacementFee =
    typeof snapshot.budget?.displacementFee === "number"
      ? snapshot.budget.displacementFee
      : 0;
  const displacementFeeLabel = formatCurrencyBRL(displacementFee);
  const displacementClause =
    displacementFee > 0
      ? `\n1.4. O presente contrato inclui uma taxa de deslocamento no valor de ${displacementFeeLabel}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.`
      : "";

  return `CLAUSULA 1a - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:
${servicesBlock}
1.2. Pelo período de ${eventHours} horas consecutivas.
1.3. O evento está previsto para ocorrer ${eventDatesText}, ${eventScheduleText}.${displacementClause}

CLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:

2.1. O valor dos serviços prestados é de ${totalAmountLabel}${displacementFee > 0 ? `, sendo ${displacementFeeLabel} referente à taxa de deslocamento` : ""}.
2.2. O pagamento deverá ser realizado à vista, via pix (CNPJ 64.062.038/0001-71) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento.
2.3. Caso a prestação dos serviços ultrapasse o horário previamente acordado, será necessário contratar horas adicionais, no valor de R$ 90,00 (noventa reais) por hora extra, por profissional.

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

CLAUSULA 9a - DOS MATERIAIS DE LIMPEZA:

9.1. A CONTRATADA se responsabiliza por disponibilizar, para a adequada execução dos serviços durante o evento, os seguintes materiais de limpeza: desinfetante, aromatizante de ambiente (cheirinho de banheiro), pano de chão, rodo, vassoura, pá de lixo, sacos de lixo, luvas e álcool.
9.2. Caso o CONTRATANTE deseje a inclusão de papel toalha e papel higiênico, este valor será cobrado à parte e adicionado ao valor total do serviço. Ressalta-se que os materiais mencionados acima serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.


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
