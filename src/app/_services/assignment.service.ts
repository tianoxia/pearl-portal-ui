import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ErrorDetails, AssignmentListResponse, AssignmentRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
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
  getAllRecruiters() {
    return this.http.get(this.baseurl + `/v1/recruiter/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getActiveClients() {
    return this.http.get(this.baseurl + `/v1/client/active`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllOffices() {
    return this.http.get(this.baseurl + `/v1/office/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllDepartments() {
    return this.http.get(this.baseurl + `/v1/department/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllContractors() {
    return this.http.get(this.baseurl + `/v1/contractor/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getLocationsByClientId(id: number) {
    return this.http.get(this.baseurl + `/v1/location/client/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getInvoiceGroupsByClientId(id: number) {
    return this.http.get(this.baseurl + `/v1/invoicegroup/client/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getContactsByClientId(id: number) {
    return this.http.get(this.baseurl + `/v1/contact/client/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAssignmentByStatus(status: string) {
    return this.http.get(this.baseurl + `/v1/assignment/status/${status}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAssignmentByClientId(status: string, clientId: number) {
    return this.http.get(this.baseurl + `/v1/assignment/client/${clientId}/status/${status}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAssignmentById(id: number) {
    return this.http.get(this.baseurl + `/v1/assignment/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  createAssignment(assignmentRequest: AssignmentRequest) {
    return this.http.post(this.baseurl + `/v1/assignment`, assignmentRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  updateAssignment(id: number, assignmentRequest: AssignmentRequest) {
    return this.http.put(this.baseurl + `/v1/assignment/${id}`, assignmentRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  updateAssignmentEndDate(id: number, assignmentRequest: AssignmentRequest) {
    return this.http.put(this.baseurl + `/v1/assignment/${id}/enddate`, assignmentRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  deleteAssignment(id: number) {
    return this.http.delete(this.baseurl + `/v1/assignment/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
