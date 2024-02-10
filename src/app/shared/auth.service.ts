import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as sha256 from 'crypto-js/sha256';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(username: string, password: string): boolean {
    const hashedUsername = sha256(username).toString();
    const hashedPassword = sha256(password).toString();

    if (hashedUsername === environment.hashedUser && hashedPassword === environment.hashedPassword) {
      const expirationTime = new Date().getTime() + 5 * 60 * 1000;
      sessionStorage.setItem('tokenExpiration', expirationTime.toString());

      return true;
    } else {
      return false;
    }
  }

  public isAuthenticated(): boolean {
    const tokenExpiration = sessionStorage.getItem('tokenExpiration');
    if (tokenExpiration) {
      const expirationTime = parseInt(tokenExpiration, 10);
      return new Date().getTime() < expirationTime;
    }
    return false;
  }

  public logout(): void {
    sessionStorage.removeItem('tokenExpiration');
  }
}
