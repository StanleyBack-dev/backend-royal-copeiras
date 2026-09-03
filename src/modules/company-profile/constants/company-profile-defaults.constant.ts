import { ICompanyProfileFields } from "../interface/company-profile.interface";

/**
 * Default CONTRATADA data (Royal Copeiras).
 *
 * Used to seed the single company profile record the first time it is
 * accessed and as a fallback whenever a field is left empty.
 *
 * `legalName` must match the CNPJ registration exactly. Adjust the fields
 * below or, preferably, edit the company profile through the Profile screen
 * once the module is deployed.
 */
export const COMPANY_PROFILE_DEFAULTS: ICompanyProfileFields = {
  legalName: "Estevam Barros Rodrigues",
  tradeName: "Royal Copeiras",
  document: "64.062.038/0001-71",
  stateRegistration: undefined,
  municipalRegistration: undefined,
  email: "royalcopeiras@gmail.com",
  phone: undefined,
  address: undefined,
  addressCity: "Goiânia",
  addressState: "GO",
  addressZipCode: undefined,
  representativeName: "Estevam Barros Rodrigues",
  representativeRole: "Titular",
  representativeDocument: undefined,
  pixKey: "64.062.038/0001-71",
  pixKeyType: "cnpj",
  issueCity: "Goiânia",
  website: undefined,
};
