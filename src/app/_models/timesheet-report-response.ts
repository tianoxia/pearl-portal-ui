export class TimesheetReportResponse {    
    clientId: number;
    clientName: string;
    projectName: string;
    billRate: number;
    contractorName: string;
    contractorId: number;
    weekEnding: Date;
    mondayDate: Date;
    tuesdayDate: Date;
    wednesdayDate: Date;
    thursdayDate: Date;
    fridayDate: Date;
    saturdayDate: Date;
    sundayDate: Date;
    weeklyTotalHours: number;
    timesheetStatus: string;
    approverName: string;
    approveTime: Date;
    
    mondayStart: string;
    mondayLunchOut: string;		
    mondayLunchIn: string;
    mondayEnd: string;
    mondayHours: number;

    tuesdayStart: string;
    tuesdayLunchOut: string;
    tuesdayLunchIn: string;
    tuesdayEnd: string;
    tuesdayHours: number;

    wednesdayStart: string;
    wednesdayLunchOut: string;
    wednesdayLunchIn: string;
    wednesdayEnd: string;
    wednesdayHours: number;

    thursdayStart: string;
    thursdayLunchOut: string;
    thursdayLunchIn: string;
    thursdayEnd: string;
    thursdayHours: number;

    fridayStart: string;
    fridayLunchOut: string;
    fridayLunchIn: string;
    fridayEnd: string;
    fridayHours: number;

    saturdayStart: string;
    saturdayLunchOut: string;
    saturdayLunchIn: string;
    saturdayEnd: string;
    saturdayHours: number;
    
    sundayStart: string;
    sundayLunchOut: string;
    sundayLunchIn: string;
    sundayEnd: string;
    sundayHours: number;
}