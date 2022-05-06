export class CommissionReportResponse {
    mtdRecruitCommissionTotal: number;
    weelyCommissionTotal: WeeklyCommissionDetail[];
    employeeCommissionReportDetails: EmployeeCommissionReportDetail[];
}
export class EmployeeCommissionReportDetail
{
    weeklyCommissionDetails: WeeklyCommissionDetail[];
    employeeId: number;
    category: string;
    employeeName: string;
    monthlyGrossMargin: number;
    recruitRate: number;
    mtdRecruitCommission: number;
}
export class WeeklyCommissionDetail
{
    weekEnding: Date;
    weeklyGrossMargin: number;
    weeklyRecruitCommission: number;
}
export class CommissionReportData {
    mtdRecruitGrossMargin: number;
    mtdSalesGrossMargin: number;
    mtdRecruitCommission: number;
    mtdSalesCommission: number;
    mtdTotalCommission: number;
    weeklyCommissionReports: WeeklyCommissionReport[];
}
export class WeeklyCommissionReport {
    weekEnding: Date;
    weeklyRecruitGrossMargin: number;
    weeklySalesGrossMargin: number;
    weeklyRecruitCommission: number;
    weeklySalesCommission: number;
    weeklyTotalCommission: number;
    commissionReportDetails: CommissionReportDetails[];
}
export class CommissionReportDetails
{
    assignment: string;
    recruitGrossMargin: number;
    salesGrossMargin: number;
    recruitRate: number;
    salesRate: number;
    recruitCommission: number;
    salesCommission: number;
    totalCommission: number;
    weekEnding: Date;
}
