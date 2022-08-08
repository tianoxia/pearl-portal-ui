import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorDetails, InvoiceReportRequest, PayFileRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceReportService {
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
  getInvoiceReport(InvoiceReportRequest: InvoiceReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/invoices`, InvoiceReportRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getLogoImage() {
    return this.http.get(`../pearlportal/assets/logo/avery_logo.gif`, { responseType: `blob` });
  }
  getAveryPartnersLogoImage() {
    return this.http.get(`../pearlportal/assets/logo/avery_partners_logo.gif`, { responseType: `blob` });
  }
  emailInvoices(data: FormData) {
    return this.http.post(this.baseurl + `/v1/report/invoices/email/`, data).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printInvoiceReport(invoiceReportRequest: InvoiceReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/invoices/pdf`, invoiceReportRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printPermInvoiceReport(invoiceReportRequest: InvoiceReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/invoices/perm/pdf`, invoiceReportRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printTimesheetReport(invoiceReportRequest: InvoiceReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/timesheets/pdf`, invoiceReportRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printExpenseReport(invoiceReportRequest: InvoiceReportRequest) {
    return this.http.post(this.baseurl + `/v1/report/expenses/pdf`, invoiceReportRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printContractorPayFile(payFileRequest: PayFileRequest) {
    return this.http.post(this.baseurl + `/v1/payfile/contract`, payFileRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  printEmployeePayFile(payFileRequest: PayFileRequest) {
    return this.http.post(this.baseurl + `/v1/payfile/employee`, payFileRequest)
    .pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
