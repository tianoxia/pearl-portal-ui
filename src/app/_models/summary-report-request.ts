import { Department } from './department';

export class SummaryReportRequest {
    fromDate: Date;
    toDate: Date;
    department: Department;
}
