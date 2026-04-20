import { Injectable } from "@nestjs/common";
import {
  PDFDocument,
  PDFFont,
  PDFImage,
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
import { SignatureAssets } from "./interfaces/signature-assets.interface";

const HEADER_HEIGHT = 68;
const LOGO_BOX_WIDTH = 80;
const LOGO_BOX_HEIGHT = 48;
const META_BOX_WIDTH = 180;
const HEADER_DIVIDER_Y = PDF_LAYOUT.pageHeight - 132;
const CONTENT_START_Y = HEADER_DIVIDER_Y - 18;
const FOOTER_RESERVED_HEIGHT = 124;
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
    const signatureAssets: SignatureAssets = {};
    try {
      const signatureRoyalBytes = await readFile(
        resolve(process.cwd(), "src/assets/images/signature-royal.png"),
      );
      signatureAssets.signatureRoyal =
        await document.embedPng(signatureRoyalBytes);
    } catch {
      // Falha ao carregar assinatura Royal, segue sem imagem
    }
    const state = this.createState(document);

    this.drawHeader(state.page, fonts, payload, headerAssets);
    state.cursorY = CONTENT_START_Y;

    this.drawSectionTitle(state, fonts, "Partes");
    this.drawParties(state, fonts, payload.parties);

    if (payload.objectParagraphs.length) {
      this.drawSectionTitle(state, fonts, "Objeto", { topSpacing: 10 });
      this.drawParagraphs(state, fonts, payload.objectParagraphs);
    }

    if (payload.clauses.length) {
      this.drawSectionTitle(state, fonts, "Clausulas");
      this.drawClauses(state, fonts, payload.clauses);
    }

    this.drawSectionTitle(state, fonts, "Assinaturas", { topSpacing: 12 });
    this.drawSignatures(state, fonts, payload, signatureAssets);

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
    this.ensureSpace(state, 22 + topSpacing);
    if (topSpacing > 0) {
      state.cursorY -= topSpacing;
    }

    state.page.drawText(title.toUpperCase(), {
      x: PDF_LAYOUT.marginX,
      y: state.cursorY,
      font: fonts.bold,
      size: 11,
      color: PDF_COLORS.text,
    });

    state.page.drawRectangle({
      x: PDF_LAYOUT.marginX,
      y: state.cursorY - 5,
      width: PDF_LAYOUT.contentWidth * 0.15,
      height: 2,
      color: PDF_COLORS.gold,
    });

    state.cursorY -= 16;
  }

  private drawParties(
    state: RenderState,
    fonts: FontSet,
    parties: ContractPdfPayloadParty[],
  ) {
    const cardGap = 12;
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
          height: 24 + lines.length * 11,
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
          y: topY - 15,
          font: fonts.bold,
          size: PDF_FONT_SIZES.small,
          color: PDF_COLORS.textMuted,
        });

        let y = topY - 29;
        for (const line of card.lines) {
          state.page.drawText(line, {
            x: cardX + 10,
            y,
            font: fonts.regular,
            size: 9,
            color: PDF_COLORS.text,
          });
          y -= 11;
        }
      });

      state.cursorY = bottomY - 6;
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
        9,
      );
      const requiredHeight = lines.length * 12 + 5;
      this.ensureSpace(state, requiredHeight);

      for (const line of lines) {
        state.page.drawText(line, {
          x: PDF_LAYOUT.marginX,
          y: state.cursorY,
          font: fonts.regular,
          size: 9,
          color: PDF_COLORS.text,
        });
        state.cursorY -= 12;
      }

      state.cursorY -= 5;
    }
  }

  private drawClauses(state: RenderState, fonts: FontSet, clauses: string[]) {
    for (let index = 0; index < clauses.length; index += 1) {
      const prefix = `${index + 1}. `;
      const lines = wrapText(
        `${prefix}${clauses[index]}`,
        PDF_LAYOUT.contentWidth - 6,
        fonts.regular,
        9,
      );
      const requiredHeight = lines.length * 12 + 4;
      this.ensureSpace(state, requiredHeight);

      for (const line of lines) {
        state.page.drawText(line, {
          x: PDF_LAYOUT.marginX,
          y: state.cursorY,
          font: fonts.regular,
          size: 9,
          color: PDF_COLORS.text,
        });
        state.cursorY -= 12;
      }

      state.cursorY -= 4;
    }
  }

  private drawSignatures(
    state: RenderState,
    fonts: FontSet,
    payload: ContractPdfPayload,
    signatureAssets?: SignatureAssets,
  ) {
    const requiredHeight = 110;
    this.ensureSpace(state, requiredHeight);

    const y = state.cursorY;
    const leftX = PDF_LAYOUT.marginX;
    const rightX = PDF_LAYOUT.marginX + PDF_LAYOUT.contentWidth / 2 + 10;
    const lineWidth = PDF_LAYOUT.contentWidth / 2 - 20;

    // Desenhar imagem de assinatura da Royal acima da linha da contratada
    if (signatureAssets?.signatureRoyal) {
      const imgWidth = 100;
      const imgHeight = 40;
      const centerX = rightX + (lineWidth - imgWidth) / 2;
      // Descer mais 8 pontos abaixo da linha
      const imgY = y - 40 - 8;
      state.page.drawImage(signatureAssets.signatureRoyal, {
        x: centerX,
        y: imgY,
        width: imgWidth,
        height: imgHeight,
      });
    }

    state.page.drawLine({
      start: { x: leftX, y: y - 40 },
      end: { x: leftX + lineWidth, y: y - 40 },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    state.page.drawLine({
      start: { x: rightX, y: y - 40 },
      end: { x: rightX + lineWidth, y: y - 40 },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    state.page.drawText(payload.signatures.contractorName, {
      x: leftX,
      y: y - 52,
      font: fonts.bold,
      size: 9,
      color: PDF_COLORS.text,
    });

    let docY = y - 64;
    if (payload.signatures.contractorDocument) {
      state.page.drawText(
        `Documento: ${payload.signatures.contractorDocument}`,
        {
          x: leftX,
          y: docY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.textMuted,
        },
      );
      docY -= 12;
    }
    // Data de assinatura contratante (somente data)
    if (payload.footer && payload.footer.cityAndIssueDate) {
      state.page.drawText(
        `Assinado em: ${payload.footer.cityAndIssueDate.replace(/^[^,]*,\s*/, "")}`,
        {
          x: leftX,
          y: docY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.textMuted,
        },
      );
    }

    state.page.drawText(payload.signatures.contractedName, {
      x: rightX,
      y: y - 52,
      font: fonts.bold,
      size: 9,
      color: PDF_COLORS.text,
    });
    let docYRight = y - 64;
    // Adicionar CNPJ da empresa abaixo do nome
    state.page.drawText("CNPJ: 64.062.038/0001-71", {
      x: rightX,
      y: docYRight,
      font: fonts.regular,
      size: 8,
      color: PDF_COLORS.textMuted,
    });
    docYRight -= 12;
    // Data de assinatura contratada (somente data)
    if (payload.footer && payload.footer.cityAndIssueDate) {
      state.page.drawText(
        `Assinado em: ${payload.footer.cityAndIssueDate.replace(/^[^,]*,\s*/, "")}`,
        {
          x: rightX,
          y: docYRight,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.textMuted,
        },
      );
    }

    if (payload.signatures.witnessOne || payload.signatures.witnessTwo) {
      const witnessY = y - 85;
      state.page.drawText("Testemunhas:", {
        x: PDF_LAYOUT.marginX,
        y: witnessY,
        font: fonts.bold,
        size: 8,
        color: PDF_COLORS.textMuted,
      });

      if (payload.signatures.witnessOne) {
        state.page.drawText(`1) ${payload.signatures.witnessOne}`, {
          x: PDF_LAYOUT.marginX + 60,
          y: witnessY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.text,
        });
      }

      if (payload.signatures.witnessTwo) {
        state.page.drawText(`2) ${payload.signatures.witnessTwo}`, {
          x: PDF_LAYOUT.marginX + 260,
          y: witnessY,
          font: fonts.regular,
          size: 8,
          color: PDF_COLORS.text,
        });
      }
    }

    state.cursorY -= requiredHeight;
  }

  private drawFooter(
    page: PDFPage,
    fonts: FontSet,
    payload: ContractPdfPayload,
    pageCounter: string,
  ) {
    const startY = 84;

    page.drawLine({
      start: { x: PDF_LAYOUT.marginX, y: startY + 28 },
      end: { x: PDF_LAYOUT.pageWidth - PDF_LAYOUT.marginX, y: startY + 28 },
      thickness: 1,
      color: PDF_COLORS.border,
    });

    page.drawText(payload.footer.cityAndIssueDate, {
      x: PDF_LAYOUT.marginX,
      y: startY + 10,
      font: fonts.bold,
      size: 9,
      color: PDF_COLORS.text,
    });

    const legalLines = wrapText(
      payload.footer.legalNotice,
      PDF_LAYOUT.contentWidth,
      fonts.regular,
      PDF_FONT_SIZES.small,
    );

    let y = startY - 6;
    for (const line of legalLines) {
      page.drawText(line, {
        x: PDF_LAYOUT.marginX,
        y,
        font: fonts.regular,
        size: PDF_FONT_SIZES.small,
        color: PDF_COLORS.textMuted,
      });
      y -= 9;
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
