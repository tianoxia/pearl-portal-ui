import { BaseApiResponse } from './base-reponse';
import { logging } from 'protractor';

export class ApiLoginResponse extends BaseApiResponse {
    result: LoginResponse;
}

export class LoginResponse {
    accessToken: string;
    expireInMinutes: number;
    employeeName: string;
    isAdmin: boolean;
    isClerical: boolean;
    employeeId: number;
}
