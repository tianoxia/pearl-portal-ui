export class HeadCountReportResponse {
    contractorTotalCount: number;
    hoursTotal: number;
    revenueTotal: number;
    grossMarginTotal: number;
    headCountsByDepartment: HeadCountByDepartment[];
}
export class HeadCountByDepartment
{
    headCountsByClientDepartment: HeadCountByClientDepartment[];
    departmentName: string;
    countractorSubTotalCount: number;
    hoursSubTotal: number;
    grossMarginSubTotal: number;
    revenueSubTotal: number;
}
export class HeadCountByClientDepartment {
    departmentName: string;
    clientName: string;
    contractorCount: number;
    hours: number;
    revenue: number;
    grossMargin: number;
}
