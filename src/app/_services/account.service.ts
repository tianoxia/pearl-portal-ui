import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { map } from 'rxjs/operators';
import { AccountProfile } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = AppConfig.settings.apiServer.baseUrl;
  }

  getAccountProfileData(accountNumber: string, memberNumber: string) {
    return this.http.get(this.baseUrl + '/v1/accounts/' + accountNumber + '/member/' + memberNumber + '/contacts')
      .pipe(map(response => {
        return response;
      }));
  }

  updateAccountProfileData(data: AccountProfile) {
    return this.http.post(this.baseUrl + '/v1/accounts/contacts/update', data)
      .pipe(map(response => {
        return response;
      }));
  }
}
