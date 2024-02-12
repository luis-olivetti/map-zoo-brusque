import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Marker } from '../models/marker';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  configUrl = 'assets/config.json';
  private apiUrl = environment.backendUrl + '/markers';

  constructor(private http: HttpClient, private router: Router) {
    this.getConfig().subscribe((config: any) => {
      environment.secondaryTokenBackend = config.secondaryTokenBackend;
    });
  }

  public getMarkers(): Observable<Marker[]> {
    return this.http
      .get<Marker[]>(this.apiUrl, { headers: this.createHeaders(false) })
      .pipe(catchError(this.handleError));
  }

  public getMarkerById(id: number): Observable<Marker> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Marker>(url, { headers: this.createHeaders(true) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  public createMarker(marker: Marker): Observable<any> {
    return this.http.post(this.apiUrl, marker, { headers: this.createHeaders(true) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  public updateMarker(marker: Marker): Observable<any> {
    const url = `${this.apiUrl}/${marker.id}`;
    return this.http.put(url, marker, { headers: this.createHeaders(true) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  public deleteMarker(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url, { headers: this.createHeaders(true) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private createHeaders(includeSecondaryToken: boolean): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('jwtToken')}`,
    });

    if (includeSecondaryToken) {
      headers = headers.set('secondaryToken', environment.secondaryTokenBackend);
    }

    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401 || error.status === 403) {
      console.error('Token JWT expirado. Redirecionando para a página de login.');
      this.router.navigate(['/login']);
      return throwError('');
    } else {
      console.error('An error occurred:', error);
      return throwError('Something went wrong. Please try again later.');
    }
  }

  private getConfig() {
    return this.http.get(this.configUrl);
  }
}
