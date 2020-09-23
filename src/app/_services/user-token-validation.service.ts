import { Injectable } from '@angular/core';
import * as jwt_decode from 'jwt-decode';
@Injectable({
  providedIn: 'root'
})
export class UserTokenValidationService {

  constructor() { }

  public isUserTokenValid(token?: string): boolean {
    const date = this.getTokenExpirationDate(token);
    if (date === undefined) { return false; }
    return (date.valueOf() > new Date().valueOf());
  }

  getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);

    if (decoded.exp === undefined) { return null; }

    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }
}
