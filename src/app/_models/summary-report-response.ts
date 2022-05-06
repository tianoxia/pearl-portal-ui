export class SummaryReportResponse {
    monthlySummary: MonthlySummary[];
    annualSummary: AnnualSummary;
}

export class AnnualSummary {
    annualContractHours: number;
    annualTotalHours: number;
    annualContractBurden: number;
    annualPermBurden: number;
    annualTotalBurden: number;
    annualContractCost: number;
    annualPermCost: number;
    annualTotalCost: number;
    annualContractInvoice: number;
    annualTotalInvoice: number;
    annualContractMargin: number;
    annualPermMargin: number;
    annualTotalMargin: number;
    annualContractNetMargin: number;
    annualPermNetMargin: number;
    annualTotalNetMargin: number;
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


