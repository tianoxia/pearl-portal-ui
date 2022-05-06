export class InvoiceGroupRequest {
    invoiceGroupId: number;
    description: string;
    invoiceContactIDs: any[];
	term: string;
	user: string;
    modified: Date;
	billingLocationId: number;
    clientId: number;
}