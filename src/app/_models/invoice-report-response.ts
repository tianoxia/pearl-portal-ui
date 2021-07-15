export class InvoiceReportResponse {
    invoiceNumber: number;
    invoiceGroupId: number;
    clientId: number;
    clientName: string;
    payPeriodId: number;
    payDate: Date;
    weekEnding1: Date;
    weekEnding2: Date;
    expenses: number;
    discount: number;
    amount: number;
    invoiceTotal: number;
    sentDate: Date;
    reportSent: string;
    filePath: string;
    fileName: string;
}
