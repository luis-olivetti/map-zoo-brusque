import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Marker } from '../models/marker';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private apiUrl = environment.backendUrl + '/markers';

  constructor(private http: HttpClient) { }

  public getMarkers(): Observable<Marker[]> {
    const headers = this.createHeaders();
    return this.http
      .get<Marker[]>(this.apiUrl, { headers })
      .pipe(catchError(this.handleError));
  }

  public getMarkerById(id: number): Observable<Marker> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.createHeaders();
    return this.http.get<Marker>(url, { headers }).pipe(catchError(this.handleError));
  }

  public createMarker(marker: Marker): Observable<any> {
    const headers = this.createHeaders();
    return this.http
      .post(this.apiUrl, marker, { headers })
      .pipe(catchError(this.handleError));
  }

  public updateMarker(marker: Marker): Observable<any> {
    const url = `${this.apiUrl}/${marker.id}`;
    const headers = this.createHeaders();
    return this.http.put(url, marker, { headers }).pipe(catchError(this.handleError));
  }

  public deleteMarker(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    const headers = this.createHeaders();
    return this.http.delete(url, { headers }).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  private createHeaders(): HttpHeaders {
    const credentials = btoa(`${environment.userBackend}:${environment.passwordBackend}`);

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    });
  }
}
