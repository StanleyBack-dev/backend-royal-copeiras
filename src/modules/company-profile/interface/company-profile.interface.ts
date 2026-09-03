export interface ICompanyProfileFields {
  legalName: string;
  tradeName: string;
  document: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  representativeName?: string;
  representativeRole?: string;
  representativeDocument?: string;
  pixKey?: string;
  pixKeyType?: string;
  issueCity?: string;
  website?: string;
}

export interface ICompanyProfile extends ICompanyProfileFields {
  idCompanyProfile: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
