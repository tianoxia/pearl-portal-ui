import { PayrollType } from "./payroll-type";

export class PayrollReportResponse {
    w2PayrollGrandTotal: number;
    corpToCorpPayrollGrandTotal: number;
    taxMatch: number;
    w2GrandTotal: number;
    expensesGrandTotal: number;
    payrollGrandTotal: number;
    payrollSubTotals: PayrollSubTotal[];
}
export class PayrollSubTotal {
    payrollType: PayrollType;
    payFrequency: number;
    subTotalHours: string;
    subTotalOTHours: string;
    subTotalDTHours: number;
    subTotalPay: number;
    subTotalExpenses: number;
    subTotalCommission: number;
    subTotalSalary: number;
    payrollDetails: PayrollDetail[];
}
export class PayrollDetail {
    employeeId: number;
    firstName: number;
    lastName: number;
    clientName: string;
    payrollType: string;
    salaryType: string;
    payMethod: string;
    weekOneData: WeeklyData;
    weekTwoData: WeeklyData;
    payRate: number;
    otRate: number;
    dtRate: number;
    totalHours: number;
    totalDTHours: number;
    totalPay: number;
    totalExpenses: number;
    totalCommission: number;
    totalSalary: number;
}
export class WeeklyData {
    weeklyHours: number;
    weeklyOTHours: number;
    weeklyDTHours: number;
    weeklyPayRate: number;
    weeklyOTRate: number;
    weeklyDTRate: number;
    weeklySalary: number;
    weeklyExpenses: number;
    weeklyCommissions: number;
    weeklyNotes: string;
}
