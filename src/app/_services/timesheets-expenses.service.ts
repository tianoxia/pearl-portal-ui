import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class TimesheetsExpensesService {
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
  getTimesheetById(id: number) {
    return this.http.get(this.baseurl + `/v1/timesheet/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getSubmittedTimesheetWeekEnding() {
    return this.http.get(this.baseurl + `/v1/weekending/all/timesheet`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getSubmittedExpenseWeekEnding() {
    return this.http.get(this.baseurl + `/v1/weekending/all/expense`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllTimesheetsByWeekending(weekEnding: string) {
    return this.http.get(this.baseurl + `/v1/timesheet/all/weekending/${weekEnding}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllTimesheetDraftsByWeekending(weekEnding: string) {
    return this.http.get(this.baseurl + `/v1/timesheetdraft/all/weekending/${weekEnding}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllExpensesByWeekending(weekEnding: string) {
    return this.http.get(this.baseurl + `/v1/expense/all/weekending/${weekEnding}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllExpenseDraftsByWeekending(weekEnding: string) {
    return this.http.get(this.baseurl + `/v1/expensedraft/all/weekending/${weekEnding}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}