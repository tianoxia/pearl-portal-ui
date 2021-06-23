export class PLReportResponse {
    details: ProfitLossData[];
    employeeId: number;
    salesPersonName: string;
    revenue: number;
    grossProfit: number;
}

export class ProfitLossData
{
    Month: string;
    regHours: number;
    otHours: number;
    dtHours: number;
    totalHours: number;
    revenue: number;
    laborCost: number;
    contractBurden: number;
    permBurden: number;
    permCost: number;
    permProfit: number;
    contractProfit: number;
    grossProfit: number;
    details: RecruiterData[];
    recruiterCost: number;
    monthlyCommissionBase: number;
    salesCommission: number;
    commissionRate: number;
    directSGA: number;
    laborCostToRevenueRatio: number;
    salesSalary: number;
    salesEarning: number;
    earningToCommissionRatio: number;
}

export class RecruiterData
{
    employeeId: number;
    firstName: string;
    lastName: string;
    name: string;
    commission: number;
    salary: number;
    expense: number;
    recruitRate: number;
}
