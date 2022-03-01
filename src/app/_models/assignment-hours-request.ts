export class AssignmentHoursRequest {
    payFrequency: string;
    payPeriodId: number;
    weekEnding: string;
    assignmentId: number;
    hours: number;
    overTimeHours: number;
    dtHours: number;
    payRate: number;
    otRate: number;
    dtRate: number;
    burdenRate: number;
    averyPrePaidExpenses: number;
    averyOutOfPocketExpenses: number;
    expenseAllowance: number;
    expenses: number;
    billRate: number;
    otBillRate: number;
    dtBillRate: number;
    notes: string;
    salesPersonId: number;
    recruiterId: number;
    hoursId: number;
    hoursRecordType: string;
}
