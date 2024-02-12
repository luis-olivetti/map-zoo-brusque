import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  public login(username: string, password: string): Observable<any> {
    console.log('login');

    return this.http.post<any>(`${environment.backendUrl}/login`, { username, password })
      .pipe(
        tap((response: { token: string }) => {
          if (response && response.token) {
            const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutos de expiração
            sessionStorage.setItem('tokenExpiration', expirationTime.toString());
            sessionStorage.setItem('jwtToken', response.token);
          }
        })
      );
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
    sessionStorage.removeItem('jwtToken');
  }
}
