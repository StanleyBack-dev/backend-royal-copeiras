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

// Joins "Logradouro, Número, Complemento, Bairro" from the structured lead
// fields, falling back to the legacy free-text `address` for leads registered
// before the structured address existed.
function buildContratanteStreetLine(lead: ContractPdfSnapshot["lead"]): string {
  const street = lead?.addressStreet?.trim();
  if (street) {
    return [
      street,
      lead?.addressNumber?.trim(),
      lead?.addressComplement?.trim(),
      lead?.addressNeighborhood?.trim(),
    ]
      .filter(Boolean)
      .join(", ");
  }

  return lead?.address?.trim() ?? "";
}

/**
 * Builds the CONTRATANTE identification lines for the "Partes" block of the
 * PDF. Only overrides the default "name + document" rendering when the lead
 * carries a razão social or address, so leads without that data keep the
 * existing simple card.
 */
function buildContratantePartyLines(
  lead: ContractPdfSnapshot["lead"],
): string[] {
  if (!lead) {
    return [];
  }

  const legalName = lead.legalName?.trim();
  const streetLine = buildContratanteStreetLine(lead);
  const cityState = [lead.addressCity?.trim(), lead.addressState?.trim()]
    .filter(Boolean)
    .join("/");
  const zipCode = lead.addressZipCode?.trim();

  if (!legalName && !streetLine && !cityState && !zipCode) {
    return [];
  }

  const lines: string[] = [];
  const name = lead.name?.trim();

  if (legalName) {
    lines.push(`Razão Social: ${legalName}`);
    if (name && name.toLowerCase() !== legalName.toLowerCase()) {
      lines.push(`Nome fantasia: ${name}`);
    }
  } else if (name) {
    lines.push(name);
  }

  if (lead.document?.trim()) {
    const documentLabel =
      lead.document.replace(/\D/g, "").length === 14 ? "CNPJ" : "CPF";
    lines.push(`${documentLabel}: ${lead.document.trim()}`);
  }

  if (streetLine || cityState || zipCode) {
    const fullAddress = [streetLine, cityState, zipCode ? `CEP ${zipCode}` : ""]
      .filter(Boolean)
      .join(" - ");
    lines.push(`Endereço: ${fullAddress}`);
  }

  if (lead.email?.trim()) {
    lines.push(`E-mail: ${lead.email.trim()}`);
  }

  if (lead.phone?.trim()) {
    lines.push(`Telefone: ${lead.phone.trim()}`);
  }

  return lines;
}

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

function allEqual<T>(values: T[]): boolean {
  return values.length > 0 && values.every((value) => value === values[0]);
}

function dayLabel(eventDates: string[], index: number): string {
  return eventDates[index]
    ? `no dia ${formatDateBR(eventDates[index])}`
    : `no ${index + 1}º dia`;
}

function buildEventLocationText(
  eventDates: string[],
  locations: string[],
): string {
  const trimmed = locations.map((location) => location?.trim() || "");

  if (!trimmed.some(Boolean)) {
    return "local a definir";
  }

  if (allEqual(trimmed)) {
    return trimmed[0] || "local a definir";
  }

  return trimmed
    .map(
      (location, index) =>
        `${dayLabel(eventDates, index)}, no local ${location || "a definir"}`,
    )
    .join("; ");
}

function buildDurationClauseText(
  eventDates: string[],
  durations: number[],
): string {
  const validDurations = durations.filter(
    (duration) => Number.isFinite(duration) && duration > 0,
  );

  if (!validDurations.length) {
    return "Pelo período de 08 horas consecutivas.";
  }

  if (allEqual(durations)) {
    return `Pelo período de ${String(durations[0]).padStart(2, "0")} horas consecutivas.`;
  }

  const parts = durations.map((duration, index) => {
    const hours =
      Number.isFinite(duration) && duration > 0
        ? String(duration).padStart(2, "0")
        : "08";
    return `${dayLabel(eventDates, index)} por ${hours} horas consecutivas`;
  });

  return `Sendo ${parts.join(", ")}.`;
}

function buildGuestCountLabel(
  eventDates: string[],
  guestCounts: number[],
  numberToPtWords: (n: number) => string,
): string | null {
  const validCounts = guestCounts.filter(
    (count) => Number.isFinite(count) && count > 0,
  );

  if (!validCounts.length) {
    return null;
  }

  if (allEqual(guestCounts)) {
    return `${guestCounts[0]} (${numberToPtWords(guestCounts[0])}) convidados`;
  }

  return guestCounts
    .map((count, index) =>
      Number.isFinite(count) && count > 0
        ? `${dayLabel(eventDates, index)}, ${count} (${numberToPtWords(count)}) convidados`
        : null,
    )
    .filter((value): value is string => Boolean(value))
    .join("; ");
}

interface ServiceLineItem {
  serviceType?: string;
  quantity?: number;
  description?: string;
  eventDateIndex?: number;
}

function buildServicesBlockPerDay(
  items: ServiceLineItem[],
  eventDates: string[],
  buildItemLine: (item: ServiceLineItem) => string,
): string {
  const byDay = new Map<number, ServiceLineItem[]>();

  items.forEach((item) => {
    const day = item.eventDateIndex ?? 0;
    const existing = byDay.get(day) ?? [];
    existing.push(item);
    byDay.set(day, existing);
  });

  const sortedDays = Array.from(byDay.keys()).sort(
    (left, right) => left - right,
  );
  const lines: string[] = [];
  let clauseIndex = 1;

  sortedDays.forEach((day) => {
    const label = dayLabel(eventDates, day);
    const capitalizedLabel = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
    lines.push(`1.1.${clauseIndex}. ${capitalizedLabel}:`);
    clauseIndex += 1;
    byDay.get(day)!.forEach((item) => {
      lines.push(`   - ${buildItemLine(item)}`);
    });
  });

  return lines.join("\n");
}

const DEFAULT_CONTRACTOR_TRADE_NAME = "Royal Copeiras";
const DEFAULT_CONTRACTOR_DOCUMENT = "64.062.038/0001-71";
const DEFAULT_ISSUE_CITY = "Goiânia";

// Human readable payment reference used in the payment clause of the contract
// body (e.g. "CNPJ 64.062.038/0001-71 - Estevam Barros Rodrigues" or
// "chave PIX contato@empresa.com - Fulano"). The name of the PIX key holder
// (representante / titular, falling back to the razão social) is always shown
// after the key value.
function buildContractorPaymentReference(
  contractor: ContractPartySnapshot,
): string {
  const document = contractor.document?.trim();
  const pixKey = contractor.pixKey?.trim();
  const pixKeyType = contractor.pixKeyType?.trim().toLowerCase();
  const ownerName =
    contractor.representativeName?.trim() || contractor.legalName?.trim();
  const ownerSuffix = ownerName ? ` - ${ownerName}` : "";

  if (pixKey && pixKeyType === "cnpj") {
    return `CNPJ ${pixKey}${ownerSuffix}`;
  }

  if (pixKey && pixKeyType === "cpf") {
    return `CPF ${pixKey}${ownerSuffix}`;
  }

  if (pixKey) {
    return `chave PIX ${pixKey}${ownerSuffix}`;
  }

  if (document) {
    return `CNPJ ${document}${ownerSuffix}`;
  }

  return `CNPJ ${DEFAULT_CONTRACTOR_DOCUMENT}${ownerSuffix}`;
}

const FEMININE_SUPPLY_UNITS = new Set([
  "unidade",
  "caixa",
  "dúzia",
  "duzia",
  "resma",
  "cartela",
  "ampola",
  "barra",
  "lata",
  "bombona",
  "bisnaga",
  "peça",
  "sacola",
]);

// Best-effort pluralization of a Portuguese unit of measure so the material
// lines in the contract read naturally for any unit ("2 rolos", "3 caixas",
// "4 pacotes", "5 litros"). Abbreviations (kg, ml, un…) are left untouched.
function pluralizeSupplyUnit(unit: string, quantity: number): string {
  const trimmed = unit.trim();
  if (!trimmed || quantity <= 1) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  const irregular: Record<string, string> = {
    par: "pares",
    galão: "galões",
    galao: "galões",
    sachê: "sachês",
    sache: "sachês",
    cartão: "cartões",
  };
  if (irregular[lower]) {
    return irregular[lower];
  }
  if (/^(kg|g|mg|ml|l|cm|m|un|pct|cx)$/i.test(trimmed)) {
    return trimmed;
  }
  if (/(ã)o$/i.test(trimmed)) {
    return trimmed.replace(/ão$/i, "ões");
  }
  if (/[rsz]$/i.test(trimmed)) {
    return `${trimmed}es`;
  }
  if (/l$/i.test(trimmed)) {
    return `${trimmed.slice(0, -1)}is`;
  }
  return `${trimmed}s`;
}

function buildDefaultBody(snapshot: ContractPdfSnapshot): string {
  const contractor = snapshot.contractor ?? {};
  const contractorTradeName =
    contractor.tradeName?.trim() ||
    contractor.legalName?.trim() ||
    DEFAULT_CONTRACTOR_TRADE_NAME;
  const contractorPaymentReference =
    buildContractorPaymentReference(contractor);
  const eventDates = snapshot.budget?.eventDates || [];
  const eventDatesText = buildEventDatesText(eventDates);
  const eventLocationText = buildEventLocationText(
    eventDates,
    snapshot.budget?.eventLocation || [],
  );
  const eventScheduleText = buildEventScheduleText(
    eventDates,
    snapshot.budget?.eventArrivalTimes || [],
    snapshot.budget?.eventDepartureTimes || [],
  );
  const durationClauseText = buildDurationClauseText(
    eventDates,
    snapshot.budget?.durationHours || [],
  );
  const totalAmountLabel =
    typeof snapshot.budget?.totalAmount === "number"
      ? formatCurrencyExtended(snapshot.budget.totalAmount)
      : "R$ 0,00 (zero reais)";
  const advancePercentage =
    typeof snapshot.budget?.advancePercentage === "number"
      ? snapshot.budget.advancePercentage
      : 30;
  // Staffing lines feed Cláusula 1ª; supply/material lines feed Cláusula 3ª.
  const allItems = snapshot.budget?.items || [];
  const items = allItems.filter((item) => item.itemType !== "SUPPLY");
  const supplyItems = allItems.filter((item) => item.itemType === "SUPPLY");

  // choose primary service type from staffing items (first defined)
  const primaryServiceType = items.length
    ? String(items[0].serviceType || "").trim()
    : "";

  const fragment = getFragmentForServiceType(primaryServiceType);

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

  const servicesBlock = !items.length
    ? `1.1.1. Prestação de serviço de 1 (um) serviço para atuação durante o evento, com foco em ${fragment}.`
    : eventDates.length <= 1
      ? items
          .map((item, index) => `1.1.${index + 1}. ${buildItemLine(item)}`)
          .join("\n")
      : buildServicesBlockPerDay(items, eventDates, buildItemLine);

  const displacementPerDay = Array.isArray(snapshot.budget?.displacementFee)
    ? snapshot.budget.displacementFee.map((value) => Number(value) || 0)
    : [];
  const displacementFee = Number(
    displacementPerDay.reduce((sum, value) => sum + value, 0).toFixed(2),
  );
  const displacementFeeLabel = formatCurrencyExtended(displacementFee);
  const displacementPerDayParts = displacementPerDay
    .map((value, index) => ({ value, day: index + 1 }))
    .filter((entry) => entry.value > 0)
    .map(
      (entry) =>
        `${formatCurrencyExtended(entry.value)} referente ao ${entry.day}º dia`,
    );
  const displacementValueText =
    displacementPerDayParts.length > 1
      ? `no valor total de ${displacementFeeLabel}, sendo ${displacementPerDayParts.join(", ")}`
      : `no valor de ${displacementFeeLabel}`;
  const displacementClause =
    displacementFee > 0
      ? `\n1.4. O presente contrato inclui uma taxa de deslocamento ${displacementValueText}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.`
      : "";

  const guestCountLabel = buildGuestCountLabel(
    eventDates,
    snapshot.budget?.guestCount || [],
    (n) => numberToPtWords(n),
  );

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

  const penaltyClause = `\n5.5. Em caso de descumprimento, pela CONTRATADA, das obrigações previstas nas Cláusulas 5.1 a 5.3 (pontualidade, qualidade e adequação da equipe, fornecimento dos materiais previstos na Cláusula 3ª), a CONTRATADA sujeitar-se-á à multa de 10% (dez por cento) sobre o valor total do contrato, sem prejuízo do direito da CONTRATANTE de exigir o cumprimento da obrigação ou de rescindir o contrato, bem como de pleitear indenização por perdas e danos comprovados.`;

  // Cláusula 3.2 — when the budget carries explicit material/supply lines they
  // are listed here as included in the total; otherwise keep the default
  // "charged separately" wording.
  // Reads as "4 (quatro) rolos de papel higiênico" / "2 (duas) unidades de
  // álcool em gel" — a standard phrase that fits any material, so the clause no
  // longer shows the bare catalog name.
  const buildSupplyLine = (it: {
    quantity?: number;
    description?: string;
    unit?: string | null;
    supplyName?: string | null;
  }): string => {
    const qty =
      it.quantity && Number.isFinite(it.quantity) && it.quantity > 0
        ? it.quantity
        : 1;
    const name = (it.supplyName || it.description || "material")
      .trim()
      .toLowerCase();
    const rawUnit = it.unit?.trim() || "unidade";
    const isFeminine = FEMININE_SUPPLY_UNITS.has(rawUnit.toLowerCase());
    const qtyWords = numberToPtWords(
      qty,
      isFeminine ? "feminine" : "masculine",
    );
    const unitLabel = pluralizeSupplyUnit(rawUnit, qty);
    return `${qty} (${qtyWords}) ${unitLabel} de ${name}`;
  };

  const suppliesClause = supplyItems.length
    ? `3.2. A CONTRATADA fornecerá ainda os seguintes materiais, cujos valores já estão incluídos no valor total deste contrato: ${supplyItems
        .map((it) => buildSupplyLine(it))
        .join(
          "; ",
        )}. Ressalta-se que os materiais mencionados serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.`
    : `3.2. Caso o contratante deseje a inclusão de papel toalha e papel higiênico, este valor será cobrado à parte e adicionado ao valor total do serviço. Ressalta-se que os materiais mencionados acima serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.`;

  return `CLAUSULA 1a - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:
${servicesBlock}
1.2. ${durationClauseText}
1.3. O evento está previsto para ocorrer ${eventDatesText}, ${eventScheduleText}, ${guestCountLabel ? `com previsão de ${guestCountLabel},` : ""} no local ${eventLocationText}.${displacementClause}

CLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:

2.1. O valor dos serviços prestados é de ${totalAmountLabel}${displacementFee > 0 ? `, sendo ${displacementFeeLabel} referente à taxa de deslocamento` : ""}.
2.2. O pagamento deverá ser realizado à vista, via pix (${contractorPaymentReference}) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento.
2.3. Caso a prestação dos serviços ultrapasse o horário previamente acordado, será necessário contratar horas adicionais, no valor de R$ 90,00 (noventa reais) por hora extra, por profissional.

CLAUSULA 3a - DOS MATERIAIS DE LIMPEZA:

3.1. A contratada se responsabiliza por disponibilizar, para a adequada execução dos serviços durante o evento, os seguintes materiais de limpeza: desinfetante, aromatizante de ambiente (cheirinho de banheiro), pano de chão, rodo, vassoura, pá de lixo, sacos de lixo, luvas e álcool.
${suppliesClause}

CLAUSULA 4a - RESPONSABILIDADES DO CONTRATANTE:

4.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços.
4.2. Caso haja necessidade de serviços adicionais não previstos no contrato, o contratante deverá comunicar a empresa com antecedência e arcar com os custos extras.

CLAUSULA 5a - RESPONSABILIDADES DA CONTRATADA:

5.1. A ${contractorTradeName} compromete-se a cumprir rigorosamente os horários acordados para a prestação dos serviços, garantindo a pontualidade da equipe designada para o evento.
5.2. A ${contractorTradeName} compromete-se a prestar os serviços contratados com equipe qualificada, assegurando a adequação técnica e comportamental dos profissionais designados.
5.3. A contratada se responsabiliza pelo fornecimento dos materiais previstos na Cláusula 3ª, necessários à adequada execução dos serviços contratados.${replacementClause}${penaltyClause}

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
          lines: buildContratantePartyLines(snapshot.lead),
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
