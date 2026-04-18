import { Injectable } from "@nestjs/common";
import { PdfDrawText } from "../../../pdf-generator/interfaces/pdf-draw-text.interface";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";

@Injectable()
export class MapBudgetPdfDrawTextsService {
  map(snapshot: BudgetPdfSnapshot, snapshotHash: string): PdfDrawText[] {
    const formatCurrency = (value: number) =>
      new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);

    const formatDate = (value: string) =>
      new Intl.DateTimeFormat("pt-BR").format(new Date(value));

    const eventDates = snapshot.budget.eventDates.length
      ? snapshot.budget.eventDates.map(formatDate).join(" e ")
      : "A definir";

    const itemsRows: PdfDrawText[] = snapshot.items
      .slice(0, 6)
      .map((item, index) => ({
        text: `${item.quantity}x  ${item.description}  —  ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.totalPrice)}`,
        x: 56,
        y: 415 - index * 18,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 460,
        clearHeight: 16,
      }));

    return [
      // ── Número e datas do orçamento (cabeçalho superior direito)
      {
        text: snapshot.budget.budgetNumber,
        x: 380,
        y: 776,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 180,
        clearHeight: 14,
      },
      {
        text: formatDate(snapshot.generatedAt),
        x: 380,
        y: 759,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 160,
        clearHeight: 14,
      },
      {
        text: formatDate(snapshot.budget.validUntil),
        x: 380,
        y: 742,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 160,
        clearHeight: 14,
      },

      // ── Dados do evento
      {
        text: eventDates,
        x: 56,
        y: 553,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 400,
        clearHeight: 14,
      },
      {
        text: snapshot.budget.eventLocation || "A definir",
        x: 56,
        y: 533,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 400,
        clearHeight: 14,
      },
      {
        text: String(snapshot.budget.guestCount ?? "Não informado"),
        x: 180,
        y: 513,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 200,
        clearHeight: 14,
      },
      {
        text: `${snapshot.budget.durationHours ?? "—"} horas`,
        x: 56,
        y: 493,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 200,
        clearHeight: 14,
      },

      // ── Itens do orçamento
      ...itemsRows,

      // ── Valores financeiros
      {
        text: formatCurrency(snapshot.budget.subtotal),
        x: 420,
        y: 308,
        fontSize: 10,
        clearBefore: true,
        clearWidth: 130,
        clearHeight: 16,
      },
      {
        text: formatCurrency(snapshot.budget.totalAmount),
        x: 420,
        y: 286,
        fontSize: 11,
        clearBefore: true,
        clearWidth: 130,
        clearHeight: 18,
      },

      // ── Condições de pagamento
      {
        text: snapshot.budget.paymentMethod || "A combinar",
        x: 56,
        y: 258,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 300,
        clearHeight: 14,
      },
      {
        text: `${snapshot.budget.advancePercentage ?? 0}% de entrada`,
        x: 56,
        y: 240,
        fontSize: 9,
        clearBefore: true,
        clearWidth: 200,
        clearHeight: 14,
      },

      // ── Rodapé: hash de auditoria
      {
        text: `Versão: ${snapshotHash.slice(0, 24)}…`,
        x: 56,
        y: 52,
        fontSize: 7,
        clearBefore: true,
        clearWidth: 320,
        clearHeight: 12,
      },
    ];
  }
}
