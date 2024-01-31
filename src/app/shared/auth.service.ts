import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  login(username: string, password: string): boolean {
    if (username === environment.user && password === environment.password) {
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
