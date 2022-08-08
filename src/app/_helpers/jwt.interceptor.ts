import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { Observable, throwError, of } from 'rxjs';
import { LoginResponse } from '../_models';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private router: Router) {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let loginResponse: LoginResponse;
        let token = null;
        if (localStorage.getItem('currentUser') !== null) {
            loginResponse = JSON.parse(localStorage.getItem('currentUser'));
            token = loginResponse.accessToken;
            if (this.isTokenExpired(token) || !loginResponse.employeeId) {
                localStorage.removeItem('currentUser');
                this.router.navigate(['/login'], { queryParams: { sessionTimeOut: true }, skipLocationChange: false });
            }
        }
        if (token != null) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(req).pipe(catchError(x=> this.handleAuthError(x)));
    }

    private handleAuthError(err: HttpErrorResponse): Observable<any> {
        //handle your auth error or rethrow
        switch (err.status) {
            /* case 401:      //login
                localStorage.removeItem('currentUser');
                this.router.navigate(['/login'], { queryParams: { sessionTimeOut: true }, skipLocationChange: false });
                return of(err.message); */
            case 403:     //forbidden
                this.router.navigateByUrl("/unauthorized");
                break;
        }
        return throwError(err);
    }

    isTokenExpired(token?: string): boolean {
        const date = this.getTokenExpirationDate(token);
        if (date === undefined) { return false; }
        return !(date.valueOf() > new Date().valueOf());
    }

    getTokenExpirationDate(token: string): Date {
        const decoded = jwt_decode(token);
        if (decoded.exp === undefined) { return null; }
        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }
}
