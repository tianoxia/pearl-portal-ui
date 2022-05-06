export class InvoiceReportRequest {
    payPeriodId: number; 
    payDate: string;
    weekEnding1: string;
    weekEnding2: string;
    payFrequency: string;
    invoiceGroupId?: number;
    isRequestFromInvoicesReport: boolean;
}
