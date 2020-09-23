import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

import { Observable } from 'rxjs';
import { LoginResponse } from '../_models';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor() {

    }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let loginResponse: LoginResponse;
        let token = null;
        if (localStorage.getItem('currentUser') !== null) {
            loginResponse = JSON.parse(localStorage.getItem('currentUser'));
            token = loginResponse.accessToken;
        }
        if (token != null) {
            req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        }
        return next.handle(req);
    }
}
