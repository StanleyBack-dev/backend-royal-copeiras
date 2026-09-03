export interface ContractPdfPayloadDetail {
  label: string;
  value: string;
}

export interface ContractPdfPayloadParty {
  role: string;
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  // When provided, these lines replace the default "name + document" rendering
  // inside the party card (used for the fully qualified CONTRATADA block).
  lines?: string[];
}

export interface ContractPdfPayload {
  companyName: string;
  companySubtitle: string;
  documentTitle: string;
  documentSubtitle: string;
  logoPlaceholderLabel: string;
  metadata: ContractPdfPayloadDetail[];
  parties: ContractPdfPayloadParty[];
  objectParagraphs: string[];
  clauses: string[];
  footer: {
    cityAndIssueDate: string;
    legalNotice: string;
  };
  referenceCode: string;
}
