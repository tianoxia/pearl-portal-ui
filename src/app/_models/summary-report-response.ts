export class SummaryReportResponse {
    monthlySummary: MonthlySummary[];
}

export class MonthlySummary {
    month: number;
    totalHours: number;
    totalBurden: number;
    totalCost: number;
    totalDiscount: number;
    totalInvoice: number;
    totalMargin: number;
    netMargin: number;
    weeklySummary: WeeklySummary[];
    monthlyPermSummary: PermPlacementMonthlySummary;
}

export class PermPlacementMonthlySummary {
    month: number;
    permCount: number;
    permBurden: number;
    totalCost: number;
    grossMargin: number;
    netMargin: number;
}

export class WeeklySummary {
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
    grossMargin: number;
    contractBurden: number;
    netMargin: number;
}


