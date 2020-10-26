import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '../_services/data.service';
import { LoginResponse } from '../_models';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<LoginResponse>;
  public currentUser$: Observable<LoginResponse>;

  constructor(private dataService: DataService) {

    let localStorageItem = null;

    if (localStorage.getItem('currentUser') !== undefined) {
      localStorageItem = JSON.parse(localStorage.getItem('currentUser'));
    }
    this.currentUserSubject = new BehaviorSubject<LoginResponse>(localStorageItem);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }
  public get currentUserValue(): LoginResponse {
    return this.currentUserSubject.value;
  }

  login(loginData) {
    return this.dataService.sendValidateUserRequest(loginData)
    .pipe(map((tokeninfo: LoginResponse) => {
      if (tokeninfo) {
        localStorage.setItem('currentUser', JSON.stringify(tokeninfo));
        localStorage.setItem('auth-token', tokeninfo.accessToken);
        this.currentUserSubject.next(tokeninfo);
        return tokeninfo;
      }
    }));
  }

  logout() {
        // remove user from session storage to log user out
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}
