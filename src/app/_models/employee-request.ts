import { EmployeePermissionDetails } from "./permission";

export class EmployeeRequest {
    employeeStatus: string;
    firstName: string;
    lastName: string;
    category: string;
    emailAddress: string;
    accessLevel: string;
    isReferer: boolean;
	password: string;
    teamLeadId?: number;
    teamManagerId: number;
    employeeType: string;     //W2,Corp to Corp,
    burdenRate: number;
	salesRateStatus: string;  //Default, FIX, Flexible
	salesRate: number;
    recruitRateStatus: string;
	recruitRate: number;
	payType: string;     //Salary, Hourly
	payRate: number;
	otRate: number;
	dtRate: number;
	adpFileNumber: string;
	payMethod: string;   //ACH,ADP ACH, Check
    startDate: Date;
    endDate?: Date;
    EmployeePermissionDetails: EmployeePermissionDetails;
}
