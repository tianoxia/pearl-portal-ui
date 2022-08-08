export class EmployeeProfitLossReportResponse {
    weelyEmployeeProfitLossTotal: WeeklyEmployeeProfitLossDetail[];
    employeeProfitLossReportDetails: EmployeeProfitLossReportDetail[];
}
export class EmployeeProfitLossReportDetail
{
    weeklyEmployeeProfitLossDetails: WeeklyEmployeeProfitLossDetail[];
    employeeId: number;
    category: string;
    name: string;
    mtdCost: number;
    mtdContractGrossMargin: number;
    mtdPermPlacementGrossMargin: number;
    ytdContractGrossMargin: number;
    ytdPermPlacementMargin: number;
    mtdGrossMargin: number;
    ytdGrossMargin: number;
}
export class WeeklyEmployeeProfitLossDetail
{
    employeeId: number;
    weekEnding: Date;
    weeklyContractGrossMargin: number;
    weeklyPermPlacementMargin: number;
    weeklySalary: number;
    weeklyExpenses: number;
    weeklyCost: number;
    weeklyCommission: number;
    weeklyProfitLossAmount: number;
}
