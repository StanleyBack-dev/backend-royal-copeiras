export interface ISendMailDTO {
    to: string;
    subject: string;
    body: string;
    from?: string;
}