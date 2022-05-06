export class AssignmentListResponse {
    assignmentId: number;
    clientId: number;
    clientName: string;
    payPeriodId: number;
    departmentId: number;
    contractorId: number;
    contractorName: string;
    payRate: number;
    otRate: number;
    billRate: number;
    otBillRate: number;
    dtRate: number;
    dtBillRate: number;
    status: string;
    payFrequency: string;
    startDate: Date;
    endDate: Date
    position: string;
    locationId: number;
    locationName: string;
    contactId: number;
    accountingLocationId: number;
    accountingContactId: number;
    salesPersonId: number;
    salesPerson: string;
    recruiterId: number;
    recruiter: string;
    purchaseOrder: string;
    burdenRate: number;
    employeeType: string;
    salesRateStatus: string;
    salesRate: number;
    recruitRateStatus: string;
    recruitRate: number;
    approved: string;
    annualSalary: number;
    permPlacementRate: number;
    permPlacementDate: Date;
    payMethod: string;
    adpFileNumber: string;
    officeId: number;
    invoiceGroupId: number;
    refererId: number;
    refererRate: number;
    secondRefererId: number;
    secondRefererRate: number;
    isNightShift: boolean;
    notes: string;
    notesModified: Date;
    notesUser: string;
    notes2: string;
    notes2Modified: Date;
    notes2User: string;
}

export class AssignmentNote
{
    notes: string;
    notesModified: Date;
    NotesUser: string;
    notes2: string;
    notes2Modified: Date;
    notes2User: string;
}