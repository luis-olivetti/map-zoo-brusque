import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Marker } from '../models/marker';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarkerService {
  private apiUrl = environment.backendUrl + '/trucksOnMap';

  constructor(private http: HttpClient) { }

  public getMarkers(): Observable<Marker[]> {
    const headers = this.createHeaders();
    return this.http
      .get<Marker[]>(this.apiUrl, { headers })
      .pipe(catchError(this.handleError));
  }

  public getMarkerById(truckId: number): Observable<Marker> {
    const url = `${this.apiUrl}/${truckId}`;
    const headers = this.createHeaders();
    return this.http.get<Marker>(url, { headers }).pipe(catchError(this.handleError));
  }

  public createMarker(truck: Marker): Observable<any> {
    const headers = this.createHeaders();
    return this.http
      .post(this.apiUrl, truck, { headers })
      .pipe(catchError(this.handleError));
  }

  public updateMarker(truck: Marker): Observable<any> {
    const url = `${this.apiUrl}/${truck.id}`;
    const headers = this.createHeaders();
    return this.http.put(url, truck, { headers }).pipe(catchError(this.handleError));
  }

  public deleteMarker(truckId: number): Observable<any> {
    const url = `${this.apiUrl}/${truckId}`;
    const headers = this.createHeaders();
    return this.http.delete(url, { headers }).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  // public getAddressFromLatLng(lat: number, lng: number): Observable<string> {
  //   const apiKey = environment.googleMapsKey;
  //   const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  //   return this.http.get<any>(geocodingUrl).pipe(
  //     map((response) => response.results[0].formatted_address),
  //     catchError(this.handleError)
  //   );
  // }

  private createHeaders(): HttpHeaders {
    const credentials = btoa(`${environment.userBackend}:${environment.passwordBackend}`);

    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
    });
  }
}
