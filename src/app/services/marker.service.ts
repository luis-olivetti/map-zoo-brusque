import { HttpClient } from '@angular/common/http';
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
    return this.http
      .get<Marker[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  public getMarkerById(truckId: number): Observable<Marker> {
    const url = `${this.apiUrl}/${truckId}`;
    return this.http.get<Marker>(url).pipe(catchError(this.handleError));
  }

  public createMarker(truck: Marker): Observable<any> {
    this.setDefaultIcon(truck);

    return this.http
      .post(this.apiUrl, truck)
      .pipe(catchError(this.handleError));
  }

  public updateMarker(truck: Marker): Observable<any> {
    const url = `${this.apiUrl}/${truck.id}`;

    this.setDefaultIcon(truck);

    return this.http.put(url, truck).pipe(catchError(this.handleError));
  }

  public deleteMarker(truckId: number): Observable<any> {
    const url = `${this.apiUrl}/${truckId}`;
    return this.http.delete(url).pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  public getAddressFromLatLng(lat: number, lng: number): Observable<string> {
    const apiKey = environment.googleMapsKey;
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    return this.http.get<any>(geocodingUrl).pipe(
      map((response) => response.results[0].formatted_address),
      catchError(this.handleError)
    );
  }

  private setDefaultIcon(marker: Marker): void {
    marker.icon = 'assets/images/star.png';
  }
}
