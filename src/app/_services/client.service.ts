import { Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ErrorDetails, ClientListResponse, ClientRequest } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
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
  getActiveClients() {
    return this.http.get(this.baseurl + `/v1/client/active`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getAllOffices() {
    return this.http.get(this.baseurl + `/v1/office/all`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
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
  getClientByStatus(status: string) {
    return this.http.get(this.baseurl + `/v1/client/status/${status}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getClientById(id: number) {
    return this.http.get(this.baseurl + `/v1/client/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  createClient(clientRequest: ClientRequest) {
    return this.http.post(this.baseurl + `/v1/client`, clientRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  updateClient(id: number, clientRequest: ClientRequest) {
    return this.http.put(this.baseurl + `/v1/client/${id}`, clientRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  updateClientEndDate(id: number, clientRequest: ClientRequest) {
    return this.http.put(this.baseurl + `/v1/client/${id}/enddate`, clientRequest).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  deleteClient(id: number) {
    return this.http.delete(this.baseurl + `/v1/client/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  uploadClientFiles(data: FormData) {
    return this.http.post(this.baseurl + `/v1/client/uploadfiles/`, data).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  getClientFiles(id: number) {
    return this.http.get(this.baseurl + `/v1/client/${id}/uploadfiles`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
  deleteClientFile(id: number) {
    return this.http.delete(this.baseurl + `/v1/client/file/${id}`).pipe(timeout(this.timeoutInSeconds), catchError(this.handleError));
  }
}
