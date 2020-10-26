import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { forkJoin, Observable, BehaviorSubject, throwError } from 'rxjs';
import { concatMap, map, catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails, SummaryReportRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = AppConfig.settings.apiServer.baseUrl;
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';
    const errorDetails = error.error as ErrorDetails;
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = 'Error: ${error.error.message}';
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
  sendValidateUserRequest(loginData: any): Observable<any> {
    return this.http.post(this.baseurl + '/tokenauth/validatelogin',
      { userName: loginData.email, password: loginData.password, browser: window.navigator.userAgent })
      .pipe(catchError(this.handleError));
  }
  getSummaryReport(summaryReportRequest: SummaryReportRequest) {
    return this.http.post(this.baseurl + `/report/summary`, summaryReportRequest).pipe(catchError(this.handleError));
  }
  getAllDepartments() {
    return this.http.get(this.baseurl + `/department/all`).pipe(catchError(this.handleError))
  }
}
