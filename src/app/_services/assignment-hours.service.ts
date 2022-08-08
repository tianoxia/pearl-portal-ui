import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails, AssignmentHoursRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentHoursService {
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
  getAssignmentHours(assignmentHoursRequest: AssignmentHoursRequest) {
    return this.http.post(this.baseurl + `/v1/report/assignmenthours/all`, assignmentHoursRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  createUpdateAssignmentHours(assignmentHoursRequest: AssignmentHoursRequest[]) {
    return this.http.post(this.baseurl + `/v1/report/assignmenthours`, assignmentHoursRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  deleteAssignmentHours(id: number) {
    return this.http.delete(this.baseurl + `/v1/report/assignmenthours/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
