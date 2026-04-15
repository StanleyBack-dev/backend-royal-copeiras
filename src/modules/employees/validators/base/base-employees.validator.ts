export class EmployeesBaseValidator {
  static validateDocument(document: string): void {
    if (!/^\d{11}$/.test(document)) {
      throw new Error("Documento deve conter 11 dígitos.");
    }
  }
}
