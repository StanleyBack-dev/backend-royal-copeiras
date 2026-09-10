export class SuppliesBaseValidator {
  static normalizeName(value: string): string {
    return String(value)
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }
}
