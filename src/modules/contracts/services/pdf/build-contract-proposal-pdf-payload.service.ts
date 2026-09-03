import { Injectable } from "@nestjs/common";
import { ContractPdfPayload } from "../../../pdf-generator/templates/contracts/interfaces/contract-pdf-payload.interface";
import { ContractPdfSnapshot } from "../../interfaces/contract-pdf-snapshot.interface";
import {
  buildContractPartyLines,
  ContractPartySnapshot,
} from "../../interfaces/contract-party.interface";
import {
  formatCurrencyExtended,
  formatDateBR,
  formatLongDateBR,
} from "../../../../utils/pdf";
import {
  getFragmentForServiceType,
  getServiceGender,
} from "../../constants/service-fragments";
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

const DEFAULT_CONTRACTOR_TRADE_NAME = "Royal Copeiras";
const DEFAULT_CONTRACTOR_DOCUMENT = "64.062.038/0001-71";
const DEFAULT_ISSUE_CITY = "Goiânia";

// Human readable payment reference used in the payment clause of the contract
// body (e.g. "CNPJ 64.062.038/0001-71" or "chave PIX contato@empresa.com").
function buildContractorPaymentReference(
  contractor: ContractPartySnapshot,
): string {
  const document = contractor.document?.trim();
  const pixKey = contractor.pixKey?.trim();
  const pixKeyType = contractor.pixKeyType?.trim().toLowerCase();

  if (pixKey && pixKeyType === "cnpj") {
    return `CNPJ ${pixKey}`;
  }

  if (pixKey && pixKeyType === "cpf") {
    return `CPF ${pixKey}`;
  }

  if (pixKey) {
    return `chave PIX ${pixKey}`;
  }

  if (document) {
    return `CNPJ ${document}`;
  }

  return `CNPJ ${DEFAULT_CONTRACTOR_DOCUMENT}`;
}

function buildDefaultBody(snapshot: ContractPdfSnapshot): string {
  const contractor = snapshot.contractor ?? {};
  const contractorTradeName =
    contractor.tradeName?.trim() ||
    contractor.legalName?.trim() ||
    DEFAULT_CONTRACTOR_TRADE_NAME;
  const contractorPaymentReference =
    buildContractorPaymentReference(contractor);
  const eventDatesText = buildEventDatesText(snapshot.budget?.eventDates || []);
  const eventLocationText =
    snapshot.budget?.eventLocation?.trim() || "local a definir";
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
      ? formatCurrencyExtended(snapshot.budget.totalAmount)
      : "R$ 0,00 (zero reais)";
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

  function numberToPtWords(
    n: number,
    gender: "masculine" | "feminine" = "masculine",
  ): string {
    if (!Number.isFinite(n)) return String(n);
    const num = Math.abs(Math.trunc(n));

    const unitsMasculine: Record<number, string> = {
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
      11: "onze",
      12: "doze",
      13: "treze",
      14: "quatorze",
      15: "quinze",
      16: "dezesseis",
      17: "dezessete",
      18: "dezoito",
      19: "dezenove",
    };

    const unitsFeminine: Record<number, string> = {
      ...unitsMasculine,
      1: "uma",
      2: "duas",
    };

    const tens: Record<number, string> = {
      20: "vinte",
      30: "trinta",
      40: "quarenta",
      50: "cinquenta",
      60: "sessenta",
      70: "setenta",
      80: "oitenta",
      90: "noventa",
    };

    const hundreds: Record<number, string> = {
      100: "cem",
      200: "duzentos",
      300: "trezentos",
      400: "quatrocentos",
      500: "quinhentos",
      600: "seiscentos",
      700: "setecentos",
      800: "oitocentos",
      900: "novecentos",
    };

    const units = gender === "feminine" ? unitsFeminine : unitsMasculine;

    function belowThousand(value: number): string {
      if (value === 0) return "";
      if (value < 20) return units[value];
      if (value < 100) {
        const t = Math.floor(value / 10) * 10;
        const r = value % 10;
        return r === 0 ? tens[t] : `${tens[t]} e ${units[r]}`;
      }
      if (value < 1000) {
        const h = Math.floor(value / 100) * 100;
        const r = value % 100;
        if (value === 100) return "cem";
        const hText = hundreds[h] || "";
        if (r === 0) return hText;
        return `${hText} e ${belowThousand(r)}`;
      }
      return "";
    }

    if (num < 1000) return belowThousand(num);

    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rest = num % 1000;
      const thousandsText =
        thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
      if (rest === 0) return thousandsText;
      const sep = rest < 100 ? " e " : " ";
      return `${thousandsText}${sep}${belowThousand(rest)}`;
    }

    return String(n);
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
    const gender = getServiceGender(it.serviceType);
    const qtyWords = numberToPtWords(qty, gender);
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
  const displacementFeeLabel = formatCurrencyExtended(displacementFee);
  const displacementClause =
    displacementFee > 0
      ? `\n1.4. O presente contrato inclui uma taxa de deslocamento no valor de ${displacementFeeLabel}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.`
      : "";

  const guestCount =
    typeof snapshot.budget?.guestCount === "number" &&
    Number.isFinite(snapshot.budget.guestCount) &&
    snapshot.budget.guestCount > 0
      ? snapshot.budget.guestCount
      : undefined;

  const guestCountLabel = guestCount
    ? `${guestCount} (${numberToPtWords(guestCount)}) convidados`
    : null;

  // build replacement clause listing actual professionals and quantities when available
  const replacementList = items.length
    ? items
        .map((it) =>
          buildItemLine(it)
            .replace(/\r?\n+/g, " ")
            .trim(),
        )
        .join(", ")
    : "copeira, garçom, recepcionista, segurança ou similares";

  const replacementClause = `\n5.4. a contratada responsabiliza-se pela substituição de qualquer profissional contratado ${replacementList} em caso de ausência, atraso ou impossibilidade de comparecimento, sem custos adicionais à contratante.`;

  return `CLAUSULA 1a - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:
${servicesBlock}
1.2. Pelo período de ${eventHours} horas consecutivas.
1.3. O evento está previsto para ocorrer ${eventDatesText}, ${eventScheduleText}, ${guestCountLabel ? `com previsão de ${guestCountLabel},` : ""} no local ${eventLocationText}.${displacementClause}
1.4. O presente contrato inclui uma taxa de deslocamento no valor de ${displacementFeeLabel}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.

CLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:

2.1. O valor dos serviços prestados é de ${totalAmountLabel}${displacementFee > 0 ? `, sendo ${displacementFeeLabel} referente à taxa de deslocamento` : ""}.
2.2. O pagamento deverá ser realizado à vista, via pix (${contractorPaymentReference}) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento.
2.3. Caso a prestação dos serviços ultrapasse o horário previamente acordado, será necessário contratar horas adicionais, no valor de R$ 90,00 (noventa reais) por hora extra, por profissional.

CLAUSULA 3a - DOS MATERIAIS DE LIMPEZA:

3.1. A contratada se responsabiliza por disponibilizar, para a adequada execução dos serviços durante o evento, os seguintes materiais de limpeza: desinfetante, aromatizante de ambiente (cheirinho de banheiro), pano de chão, rodo, vassoura, pá de lixo, sacos de lixo, luvas e álcool.
3.2. Caso o contratante deseje a inclusão de papel toalha e papel higiênico, este valor será cobrado à parte e adicionado ao valor total do serviço. Ressalta-se que os materiais mencionados acima serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.

CLAUSULA 4a - RESPONSABILIDADES DO CONTRATANTE:

4.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços.
4.2. Caso haja necessidade de serviços adicionais não previstos no contrato, o contratante deverá comunicar a empresa com antecedência e arcar com os custos extras.

CLAUSULA 5a - RESPONSABILIDADES DA CONTRATADA:

5.1. A ${contractorTradeName} compromete-se a prestar os serviços contratados com equipe qualificada.${replacementClause}

CLAUSULA 6a - CANCELAMENTO E REEMBOLSO:

6.1. O contratante poderá cancelar o serviço a qualquer momento, desde que o faça com pelo menos 5 dias de antecedência.
6.2. Caso o cancelamento ocorra antes do prazo de 5 dias, o valor pago a título de sinal será devolvido ao contratante de forma integral pela contratada.
6.3. Se o cancelamento for realizado após o prazo de 5 dias, o contratante não terá direito ao reembolso do sinal já pago.

CLAUSULA 7a - ALTERAÇÕES CONTRATUAIS (ADENDOS E ADITIVOS):

7.1. Este contrato poderá sofrer alterações mediante comum acordo entre as partes.
7.2. As alterações devem ser solicitadas com antecedência mínima de 5 dias antes da data do evento e estarão sujeitas à aprovação da ${contractorTradeName}.
7.3. Qualquer alteração de valores, condições ou quantidade de profissionais será formalizada e anexada ao presente contrato como adendo ou aditivo, conforme necessário.

CLAUSULA 8a - VIGÊNCIA:

8.1. O presente contrato tem início na data de sua assinatura e terá vigência até a conclusão das obrigações previstas neste instrumento.

CLAUSULA 9a - CONDIÇÕES GERAIS:

9.1. O contratante declara que todas as suas dúvidas foram devidamente esclarecidas.


DISPOSIÇÕES FINAIS:

Para quaisquer dúvidas ou maiores esclarecimentos, estamos à disposição.

Atenciosamente,
Equipe ${contractorTradeName}`;
}

@Injectable()
export class BuildContractProposalPdfPayloadService {
  build(
    snapshot: ContractPdfSnapshot,
    snapshotHash: string,
  ): ContractPdfPayload {
    const now = new Date();
    const contractantName = snapshot.lead?.name || "Contratante";
    const contractor = snapshot.contractor ?? {};
    const contractorTradeName =
      contractor.tradeName?.trim() ||
      contractor.legalName?.trim() ||
      DEFAULT_CONTRACTOR_TRADE_NAME;
    const contractorLegalName =
      contractor.legalName?.trim() || contractorTradeName;
    const issueCity =
      contractor.issueCity?.trim() ||
      contractor.addressCity?.trim() ||
      DEFAULT_ISSUE_CITY;
    const issueDate =
      snapshot.contract.issueDate || formatContractDateOnly(now);
    const validUntil = snapshot.contract.validUntil
      ? formatDateBR(snapshot.contract.validUntil)
      : "Nao informado";
    const bodyText = snapshot.contract.body || buildDefaultBody(snapshot);
    const objectParagraphs = splitBodyIntoParagraphs(bodyText);
    const clauses: string[] = [];

    return {
      companyName: contractorTradeName,
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
          name: contractantName,
          document: snapshot.lead?.document,
          email: snapshot.lead?.email,
          phone: snapshot.lead?.phone,
        },
        {
          role: "Contratada",
          name: contractorLegalName,
          document: contractor.document,
          email: contractor.email,
          phone: contractor.phone,
          lines: buildContractPartyLines(contractor),
        },
      ],
      objectParagraphs,
      clauses,
      footer: {
        cityAndIssueDate: `${issueCity}, ${formatLongDateBR(now)}`,
        legalNotice:
          "Este contrato reflete o acordo entre as partes para a prestação dos serviços especificados, com validade jurídica após aceite e assinatura.",
      },
      referenceCode: snapshotHash,
    };
  }
}
