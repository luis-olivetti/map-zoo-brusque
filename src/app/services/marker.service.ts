import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Marker } from '../models/marker';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private apiUrl = environment.backendUrl + '/markers';
  private token: string = '';

  constructor(private http: HttpClient) { }

  public getMarkers(): Observable<Marker[]> {
    return this.http
      .get<Marker[]>(this.apiUrl, { headers: this.createHeaders(false) })
      .pipe(catchError(this.handleError));
  }

  public getMarkerById(id: number): Observable<Marker> {
    const url = `${this.apiUrl}/${id}`;
    return this.authenticateAndCall(() => {
      return this.http.get<Marker>(url, { headers: this.createHeaders(true) }).pipe(catchError(this.handleError));
    });
  }

  public createMarker(marker: Marker): Observable<any> {
    return this.authenticateAndCall(() => {
      return this.http.post(this.apiUrl, marker, { headers: this.createHeaders(true) }).pipe(
        catchError(this.handleError)
      );
    });
  }

  public updateMarker(marker: Marker): Observable<any> {
    const url = `${this.apiUrl}/${marker.id}`;
    return this.authenticateAndCall(() => {
      return this.http.put(url, marker, { headers: this.createHeaders(true) }).pipe(catchError(this.handleError));
    });
  }

  public deleteMarker(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.authenticateAndCall(() => {
      return this.http.delete(url, { headers: this.createHeaders(true) }).pipe(catchError(this.handleError));
    });
  }

  private authenticateAndCall(call: () => Observable<any>): Observable<any> {
    return this.authenticate().pipe(
      switchMap(() => {
        return call();
      })
    );
  }

  private authenticate(): Observable<any> {
    const username = environment.userBackend;
    const password = environment.passwordBackend;
    const body = { username, password };

    return this.http.post<any>(`${environment.backendUrl}/login`, body).pipe(
      map(response => {
        this.token = response.token;
        return response;
      }),
      catchError(error => {
        console.error('Authentication error:', error);
        return throwError('Authentication failed');
      })
    );
  }

  private createHeaders(includeSecondaryToken: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    });

    if (includeSecondaryToken) {
      headers = headers.set('secondaryToken', environment.secondaryTokenBackend);
    }

    return headers;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  private createHeadersAndAuthenticate(): Observable<HttpHeaders> {
    return this.authenticate().pipe(
      map(() => {
        return this.createHeaders(true);
      }),
      catchError(error => {
        console.error('Authentication error:', error);
        return throwError('Authentication failed');
      })
    );
  }
}
