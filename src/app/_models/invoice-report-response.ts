import { UploadedFile } from './contractor-list-response';
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
    receipts: UploadedFile[];
}
export class InvoicePdfResponse {
    invoiceNumber: number;
	invoiceDetails: InvoicePdfData[];
	term: string;
	clientName: string;
	purchaseOrderNo: number;
}
export class InvoicePdfData {
    name: string;
    expenses: number;
    discount: number;
    billRate: number;
    regularAmount: number;
    hours: number;
    otBillRate: number;
    otHours: number;
    otAmount: number;
    dtBillRate: number;
    dtHours: number;
    dtAmount: number;
    amount: number;
    invoiceTotal: number;
    position: string;
}
