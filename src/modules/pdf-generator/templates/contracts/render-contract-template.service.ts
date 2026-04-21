import { Injectable } from "@nestjs/common";
import {
  PDFDocument,
  PDFImage,
  PDFFont,
  PDFPage,
  StandardFonts,
} from "pdf-lib";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  PDF_COLORS,
  PDF_FONT_SIZES,
  PDF_LAYOUT,
} from "../../design-system/pdf-design-system";
import { PdfTemplateKey } from "../../enums/pdf-template-key.enum";
import { PdfTemplateRenderer } from "../../interfaces/pdf-template-renderer.interface";
import {
  ContractPdfPayload,
  ContractPdfPayloadParty,
} from "./interfaces/contract-pdf-payload.interface";
import { wrapText } from "../../../../utils/pdf";

const HEADER_HEIGHT = 68;
const LOGO_BOX_WIDTH = 80;
const LOGO_BOX_HEIGHT = 48;
const META_BOX_WIDTH = 180;
const HEADER_DIVIDER_Y = PDF_LAYOUT.pageHeight - 132;
const CONTENT_START_Y = HEADER_DIVIDER_Y - 30;
const FOOTER_RESERVED_HEIGHT = 84;
const LOGO_IMAGE_PATH = resolve(process.cwd(), "src/assets/images/logo.png");

interface FontSet {
  regular: PDFFont;
  bold: PDFFont;
}

interface HeaderAssets {
  logo?: PDFImage;
}

interface RenderState {
  document: PDFDocument;
  page: PDFPage;
  pages: PDFPage[];
  cursorY: number;
}

@Injectable()
export class RenderContractTemplateService implements PdfTemplateRenderer<ContractPdfPayload> {
  readonly templateKey = PdfTemplateKey.CONTRACTS;

  async render(payload: ContractPdfPayload): Promise<Buffer> {
    const document = await PDFDocument.create();
    const fonts = await this.loadFonts(document);
    const headerAssets = await this.loadHeaderAssets(document);
    const state = this.createState(document);

    this.drawHeader(state.page, fonts, payload, headerAssets);
    state.cursorY = CONTENT_START_Y;

    this.drawSectionTitle(state, fonts, "Partes");
    this.drawParties(state, fonts, payload.parties);

    if (payload.objectParagraphs.length) {
      this.drawSectionTitle(state, fonts, "Objeto", { topSpacing: 18 });
      this.drawParagraphs(state, fonts, payload.objectParagraphs);
    }

    if (payload.clauses.length) {
      this.drawSectionTitle(state, fonts, "Clausulas");
      this.drawClauses(state, fonts, payload.clauses);
    }

    for (let index = 0; index < state.pages.length; index += 1) {
      this.drawFooter(
        state.pages[index],
        fonts,
        payload,
        `${index + 1}/${state.pages.length}`,
      );
    }

    const pdfBytes = await document.save();
    return Buffer.from(pdfBytes);
  }

  private async loadFonts(document: PDFDocument): Promise<FontSet> {
    const [regular, bold] = await Promise.all([
      document.embedFont(StandardFonts.Helvetica),
      document.embedFont(StandardFonts.HelveticaBold),
    ]);

    return { regular, bold };
  }

  private async loadHeaderAssets(document: PDFDocument): Promise<HeaderAssets> {
    try {
      const logoBytes = await readFile(LOGO_IMAGE_PATH);
      const logo = await document.embedPng(logoBytes);
      return { logo };
    } catch {
      return {};
    }
  }

  private createState(document: PDFDocument): RenderState {
    const page = document.addPage([
      PDF_LAYOUT.pageWidth,
      PDF_LAYOUT.pageHeight,
    ]);
    this.paintPageBackground(page);

    return {
      document,
      page,
      pages: [page],
      cursorY: CONTENT_START_Y,
    };
  }

  private paintPageBackground(page: PDFPage) {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: PDF_LAYOUT.pageWidth,
      height: PDF_LAYOUT.pageHeight,
      color: PDF_COLORS.white,
    });

    page.drawRectangle({
      x: 0,
      y: PDF_LAYOUT.pageHeight - HEADER_HEIGHT,
      width: PDF_LAYOUT.pageWidth,
      height: HEADER_HEIGHT,
      color: PDF_COLORS.bgLight,
    });

    page.drawRectangle({
      x: 0,
      y: PDF_LAYOUT.pageHeight - 6,
      width: PDF_LAYOUT.pageWidth,
      height: 6,
      color: PDF_COLORS.gold,
    });
  }

  private addPage(state: RenderState) {
    const page = state.document.addPage([
      PDF_LAYOUT.pageWidth,
      PDF_LAYOUT.pageHeight,
    ]);
    this.paintPageBackground(page);
    state.page = page;
    state.pages.push(page);
    state.cursorY = CONTENT_START_Y;
  }

  private ensureSpace(state: RenderState, requiredHeight: number) {
    if (state.cursorY - requiredHeight < FOOTER_RESERVED_HEIGHT) {
      this.addPage(state);
    }
  }

  private drawHeader(
    page: PDFPage,
    fonts: FontSet,
    payload: ContractPdfPayload,
    headerAssets: HeaderAssets,
  ) {
    const logoX = PDF_LAYOUT.marginX;
    const logoY = PDF_LAYOUT.pageHeight - 86;

    page.drawRectangle({
      x: logoX,
      y: logoY,
      width: LOGO_BOX_WIDTH,
      height: LOGO_BOX_HEIGHT,
      borderColor: PDF_COLORS.gold,
      borderWidth: 1.2,
      color: PDF_COLORS.white,
    });

    if (headerAssets.logo) {
      this.drawLogoImage(page, headerAssets.logo, logoX, logoY);
    } else {
      page.drawText(payload.logoPlaceholderLabel, {
        x: logoX + 12,
        y: logoY + 21,
        font: fonts.bold,
        size: PDF_FONT_SIZES.small,
        color: PDF_COLORS.textMuted,
      });
    }

    const textX = logoX + LOGO_BOX_WIDTH + 16;
    page.drawText(payload.companyName, {
      x: textX,
      y: PDF_LAYOUT.pageHeight - 62,
      font: fonts.bold,
      size: 20,
      color: PDF_COLORS.text,
    });

    page.drawText(payload.companySubtitle, {
      x: textX,
      y: PDF_LAYOUT.pageHeight - 78,
      font: fonts.regular,
      size: PDF_FONT_SIZES.small,
      color: PDF_COLORS.textMuted,
    });

    page.drawText(payload.documentSubtitle, {
      x: textX,
      y: PDF_LAYOUT.pageHeight - 90,
      font: fonts.regular,
      size: PDF_FONT_SIZES.small,
      color: PDF_COLORS.textMuted,
    });

    const metaBoxX = PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginX - META_BOX_WIDTH;
    const metaBoxY = PDF_LAYOUT.pageHeight - 96;
    page.drawRectangle({
      x: metaBoxX,
      y: metaBoxY,
      width: META_BOX_WIDTH,
      height: 62,
      borderColor: PDF_COLORS.border,
      borderWidth: 1,
      color: PDF_COLORS.white,
    });

    let metaY = metaBoxY + 44;
    for (const detail of payload.metadata) {
      page.drawText(`${detail.label}:`, {
        x: metaBoxX + 10,
        y: metaY,
        font: fonts.bold,
        size: PDF_FONT_SIZES.small,
        color: PDF_COLORS.text,
      });

      page.drawText(detail.value, {
        x: metaBoxX + 74,
        y: metaY,
        font: fonts.regular,
        size: PDF_FONT_SIZES.small,
        color: PDF_COLORS.textMuted,
      });

      metaY -= 12;
      if (metaY < metaBoxY + 8) {
        break;
      }
    }

    page.drawLine({
      start: { x: PDF_LAYOUT.marginX, y: HEADER_DIVIDER_Y },
      end: {
        x: PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginX,
        y: HEADER_DIVIDER_Y,
      },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    const documentTitle = payload.documentTitle.toUpperCase();
    const documentTitleSize = 14;
    const documentTitleWidth = fonts.bold.widthOfTextAtSize(
      documentTitle,
      documentTitleSize,
    );
    const documentTitleX = (PDF_LAYOUT.pageWidth - documentTitleWidth) / 2;

    page.drawText(documentTitle, {
      x: documentTitleX,
      y: HEADER_DIVIDER_Y + 12,
      font: fonts.bold,
      size: documentTitleSize,
      color: PDF_COLORS.goldDark,
    });
  }

  private drawLogoImage(
    page: PDFPage,
    logo: PDFImage,
    logoX: number,
    logoY: number,
  ) {
    const inset = 4;
    const availableWidth = LOGO_BOX_WIDTH - inset * 2;
    const availableHeight = LOGO_BOX_HEIGHT - inset * 2;
    const scale = Math.min(
      availableWidth / logo.width,
      availableHeight / logo.height,
    );
    const width = logo.width * scale;
    const height = logo.height * scale;
    const x = logoX + (LOGO_BOX_WIDTH - width) / 2;
    const y = logoY + (LOGO_BOX_HEIGHT - height) / 2;

    page.drawImage(logo, {
      x,
      y,
      width,
      height,
    });
  }

  private drawSectionTitle(
    state: RenderState,
    fonts: FontSet,
    title: string,
    options?: { topSpacing?: number },
  ) {
    const topSpacing = options?.topSpacing ?? 0;
    this.ensureSpace(state, 18 + topSpacing);
    if (topSpacing > 0) {
      state.cursorY -= topSpacing;
    }

    state.page.drawText(title.toUpperCase(), {
      x: PDF_LAYOUT.marginX,
      y: state.cursorY,
      font: fonts.bold,
      size: 10,
      color: PDF_COLORS.text,
    });

    state.page.drawRectangle({
      x: PDF_LAYOUT.marginX,
      y: state.cursorY - 5,
      width: PDF_LAYOUT.contentWidth * 0.15,
      height: 2,
      color: PDF_COLORS.gold,
    });

    state.cursorY -= 13;
  }

  private drawParties(
    state: RenderState,
    fonts: FontSet,
    parties: ContractPdfPayloadParty[],
  ) {
    const cardGap = 10;
    const cardWidth = (PDF_LAYOUT.contentWidth - cardGap) / 2;

    for (let index = 0; index < parties.length; index += 2) {
      const rowParties = parties.slice(index, index + 2);
      const cardData = rowParties.map((party) => {
        const details = [
          party.name,
          party.document ? `Documento: ${party.document}` : undefined,
        ].filter((value): value is string => Boolean(value));

        const lines = details.flatMap((detail) =>
          wrapText(detail, cardWidth - 20, fonts.regular, 9),
        );

        return {
          party,
          lines,
          height: 20 + lines.length * 9,
        };
      });

      const rowHeight = Math.max(...cardData.map((card) => card.height));
      this.ensureSpace(state, rowHeight + 6);

      const topY = state.cursorY;
      const bottomY = topY - rowHeight;

      cardData.forEach((card, cardIndex) => {
        const cardX = PDF_LAYOUT.marginX + cardIndex * (cardWidth + cardGap);

        state.page.drawRectangle({
          x: cardX,
          y: bottomY,
          width: cardWidth,
          height: rowHeight,
          borderColor: PDF_COLORS.border,
          borderWidth: 1,
          color: PDF_COLORS.rowAlt,
        });

        state.page.drawText(card.party.role.toUpperCase(), {
          x: cardX + 10,
          y: topY - 13,
          font: fonts.bold,
          size: 7,
          color: PDF_COLORS.textMuted,
        });

        let y = topY - 24;
        for (const line of card.lines) {
          state.page.drawText(line, {
            x: cardX + 10,
            y,
            font: fonts.regular,
            size: 8,
            color: PDF_COLORS.text,
          });
          y -= 9;
        }
      });

      state.cursorY = bottomY - 4;
    }
  }

  private drawParagraphs(
    state: RenderState,
    fonts: FontSet,
    paragraphs: string[],
  ) {
    for (const paragraph of paragraphs) {
      const lines = wrapText(
        paragraph,
        PDF_LAYOUT.contentWidth,
        fonts.regular,
        8,
      );
      const requiredHeight = lines.length * 10 + 3;
      this.ensureSpace(state, requiredHeight);

      for (const line of lines) {
        state.page.drawText(line, {
          x: PDF_LAYOUT.marginX,
          y: state.cursorY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.text,
        });
        state.cursorY -= 10;
      }

      state.cursorY -= 3;
    }
  }

  private drawClauses(state: RenderState, fonts: FontSet, clauses: string[]) {
    for (let index = 0; index < clauses.length; index += 1) {
      const prefix = `${index + 1}. `;
      const lines = wrapText(
        `${prefix}${clauses[index]}`,
        PDF_LAYOUT.contentWidth - 6,
        fonts.regular,
        8,
      );
      const requiredHeight = lines.length * 10 + 3;
      this.ensureSpace(state, requiredHeight);

      for (const line of lines) {
        state.page.drawText(line, {
          x: PDF_LAYOUT.marginX,
          y: state.cursorY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.text,
        });
        state.cursorY -= 10;
      }

      state.cursorY -= 3;
    }
  }

  private drawFooter(
    page: PDFPage,
    fonts: FontSet,
    payload: ContractPdfPayload,
    pageCounter: string,
  ) {
    const startY = 62;

    page.drawLine({
      start: { x: PDF_LAYOUT.marginX, y: startY + 28 },
      end: { x: PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginX, y: startY + 28 },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    page.drawText(payload.footer.cityAndIssueDate, {
      x: PDF_LAYOUT.marginX,
      y: startY + 8,
      font: fonts.bold,
      size: 8,
      color: PDF_COLORS.text,
    });

    const legalLines = wrapText(
      payload.footer.legalNotice,
      PDF_LAYOUT.contentWidth,
      fonts.regular,
      7,
    );

    let y = startY - 4;
    for (const line of legalLines) {
      page.drawText(line, {
        x: PDF_LAYOUT.marginX,
        y,
        font: fonts.regular,
        size: 7,
        color: PDF_COLORS.textMuted,
      });
      y -= 8;
    }

    page.drawText(
      `Ref. ${payload.referenceCode.slice(0, 12)}  Pag. ${pageCounter}`,
      {
        x: PDF_LAYOUT.pageWidth - 170,
        y: 24,
        font: fonts.regular,
        size: PDF_FONT_SIZES.micro,
        color: PDF_COLORS.textLight,
      },
    );
  }
}
