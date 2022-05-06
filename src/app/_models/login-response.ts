import { BaseApiResponse } from './base-reponse';
import { logging } from 'protractor';
import { EmployeePermission } from './permission';

export class ApiLoginResponse extends BaseApiResponse {
    result: LoginResponse;
}

export class LoginResponse {
    accessToken: string;
    expireInMinutes: number;
    employeeName: string;
    role: string;
    employeeId: number;
    employeePermissions: EmployeePermission[];
}
