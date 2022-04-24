import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails, ProviderEmployeeRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ProviderEmployeeService {
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
  getAllCandidateSources() {
    return this.http.get(this.baseurl + `/v1/candidatesource/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getProviderEmployeeByStatusAndType(status: string, serviceType: string, contractService: boolean) {
    return this.http.get(this.baseurl + `/v1/provideremployee/status/${status}/servicetype/${serviceType}/contractservice/${contractService}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getProviderEmployeeById(id: number) {
    return this.http.get(this.baseurl + `/v1/provideremployee/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  createProviderEmployee(provideremployeeRequest: ProviderEmployeeRequest) {
    return this.http.post(this.baseurl + `/v1/provideremployee`, provideremployeeRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  updateProviderEmployee(id: number, provideremployeeRequest: ProviderEmployeeRequest) {
    return this.http.put(this.baseurl + `/v1/provideremployee/${id}`, provideremployeeRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  deleteProviderEmployee(id: number) {
    return this.http.delete(this.baseurl + `/v1/provideremployee/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  uploadProviderEmployeeFiles(data: FormData) {
    return this.http.post(this.baseurl + `/v1/provideremployee/uploadfiles/`, data).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getProviderEmployeeFiles(id: number) {
    return this.http.get(this.baseurl + `/v1/provideremployee/${id}/uploadfiles`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
