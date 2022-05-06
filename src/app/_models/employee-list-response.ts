import { EmployeePermission, EmployeePermissionDetails } from "./permission";
import { UploadedFile } from "./uploaded-file";
export class EmployeeListResponse {
    employeeStatus: string;
    employeeId: number;
    firstName: string;
    lastName: string;
    password: string;
    isReferer: boolean;
    category: string;
    teamLeadId?: number;
    teamManagerId: number;
    employeeType: string;
    burdenRate: number;
	salesRateStatus: string;  //Default, FIX, Flexible
	salesRate: number;
    recruitRateStatus: string;
	recruitRate: number;
	payType: string;     //Salary, Hourly
	payRate: number;
	otRate: number;
	dtRate: number;
    emailAddress: string;
    accessLevel: string;
    startDate: Date;
    endDate?: Date;
    payMethod: string;   //ACH,ADP ACH, Check
    employeeAttachments: UploadedFile[];
    employeePermissionDetails: EmployeePermissionDetails;
}
