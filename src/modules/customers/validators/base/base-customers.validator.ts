export class CustomersBaseValidator {
  static validateRanges(weight: number): void {
    if (weight < 20 || weight > 300) {
      throw new Error("Peso fora do intervalo permitido.");
    }
  }

  static validateDate(date: string): void {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new Error("Data inválida.");
    }
    const now = new Date();
    if (parsed > now) {
      throw new Error("Data não pode ser no futuro.");
    }
  }
}
