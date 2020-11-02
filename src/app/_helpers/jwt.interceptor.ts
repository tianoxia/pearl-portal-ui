import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import * as jwt_decode from 'jwt-decode';
import { Observable } from 'rxjs';
import { LoginResponse } from '../_models';
import { Router } from '@angular/router';

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
            if (this.isTokenExpired(token)) {
                this.router.navigate(['/login']);
            }
        }
        if (token != null) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(req);
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
