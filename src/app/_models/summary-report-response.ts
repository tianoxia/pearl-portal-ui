export class SummaryReportResponse {
    fromDate: Date;
    toDate: Date;
    weekEnding: Date;
    contractorCount: number;
    totalHours: number;
    avgHours: number;
    billRate: number;
    payRate: number;
    hourlyMargin: number;
    totalCost: number;
    totalDiscount: number;
    totalInvoice: number;
    burden: number;
    totalMargin: number;
}
