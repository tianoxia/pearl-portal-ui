export class HeadCountReportRequest {
    fromDate?: Date;
    toDate?: Date;
    employeeId: number;
    payFrequency: string;
    weekEnding: Date;
}
