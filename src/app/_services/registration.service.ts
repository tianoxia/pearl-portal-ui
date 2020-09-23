import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { AppConfig } from '../app.config';
import { map } from 'rxjs/operators';
import { RegisterUser } from '../_models';


@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  baseurl: string;

  constructor(private http: HttpClient) {
    this.baseurl = AppConfig.settings.apiServer.baseUrl;
  }

  registerUser(data) {

    return this.http.post<RegisterUser>(this.baseurl + '/register/user',
      {
        accountNumber: data.accountNumber,
        controlNumber: data.controlNumber,
        userName: data.email,
        hasOptedForPaperlessBilling: data.hasOptedForPaperlessBilling,
        hasOptedForPaperlessOther: data.hasOptedForPaperlessOther,
        areMarketingEmailsAllowed: data.areMarketingEmailsAllowed
      })
      .pipe(map(response => {
        if (response) {
          return response;
        }

      }));
  }

  validateEmail(email) {
    return this.http.get(this.baseurl + '/register/user/' + email + '/exists', { responseType: 'text' as 'json' })
      .pipe(map(response => {
        return response;
      }));
  }

  validateResetPasswordUrl(cipherLink) {
    let params = new HttpParams();
    params = params.append('cipherLink', cipherLink);
    return this.http.get(this.baseurl + '/register/resetpassword/validateurl', { params })
      .pipe(map(response => {
        return response;
      }));
  }

  resetPassword(data) {
    return this.http.post(this.baseurl + '/register/resetpassword',
      {
        userName: data.email,
        password: data.password
      })
      .pipe(map(response => {
        return response;
      }));
  }
}
