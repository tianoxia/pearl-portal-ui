export class PayrollReportRequest {
    employeeStatus: string;
    category: string;
    payFrequency: string;
    weekEnding1: Date;
    weekEnding2: Date | null;
    payDate: Date;
}
