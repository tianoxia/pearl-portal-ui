import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails, SummaryReportRequest, PLReportRequest, CustomReportRequest,
  LoginRequest, ControlReportRequest, AssignmentHoursRequest, ReferalReportRequest } from '../_models';
import { CommissionReportRequest } from 'app/_models/commission-report-request';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseurl: string;
  timeoutInSeconds: number;

  constructor(private http: HttpClient, private router: Router) {
    this.baseurl = AppConfig.settings.apiServer.baseUrl;
    this.timeoutInSeconds = AppConfig.settings.apiServer.timeoutInSeconds;
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    const errorDetails = error.error as ErrorDetails;
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = 'Error: ${error.error.message}';
    } else if (error.status === 403) {
      errorMessage = 'You Do Not Have Sufficient Rights To Perform This Action';
    } else if (error.status === 404) {
      errorMessage = 'Service unavailable, please contact administrator.';
    } else if (error.status === 401) {
      setTimeout(() => this.router.navigate(['login'], { queryParams: { returnUrl: this.router.routerState.snapshot.url } }));
      errorMessage = errorDetails[0].message;
    } else if (error.status === 400) {
      // Server-side errors
      errorMessage = errorDetails[0].message;
    } else if (error.status === 500) {
      errorMessage = 'We are unable to process your request at this time. Please try again later.';
    } else if (errorDetails !== null) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.status + ' ' + error.statusText;
    }
    return throwError(errorMessage);
  }
  sendValidateUserRequest(loginData: LoginRequest): Observable<any> {
    return this.http.post(this.baseurl + '/v1/tokenauth/validatelogin', loginData)
      .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllDepartments() {
    return this.http.get(this.baseurl + `/v1/department/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllRecruiters() {
    return this.http.get(this.baseurl + `/v1/recruiter/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllClients() {
    return this.http.get(this.baseurl + `/v1/client/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getSummaryReport(summaryReportRequest: SummaryReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/summary`, summaryReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }  
  getCustomReport(customReportRequest: CustomReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/custom`, customReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getControlReport(controlReportRequest: ControlReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/control`, controlReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAssignmentHours(assignmentHoursRequest: AssignmentHoursRequest) {
    return this.http.post(this.baseurl + `/v1/report/assignmenthours/all`, assignmentHoursRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getCommissionReport(commissionReportRequest: CommissionReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/commission`, commissionReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getCommissionDetailReport(commissionReportRequest: CommissionReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/commission/detail`, commissionReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getMonthlyControlReport(controlReportRequest: ControlReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/control/monthly`, controlReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getTeamPLReport(teamPLReportRequest: PLReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/teampl`, teamPLReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllPayPeriods(payFreq: string) {
    return this.http.get(this.baseurl + `/v1/payperiod/payfreq/${payFreq}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getReferalReport(referalReportRequest: ReferalReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/referal`, referalReportRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
