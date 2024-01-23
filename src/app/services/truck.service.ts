import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Truck } from '../models/truck';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TruckService {
  private apiUrl = 'http://localhost:3000/trucksOnMap';

  constructor(private http: HttpClient) {}

  public getTrucks(): Observable<Truck[]> {
    return this.http
      .get<Truck[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  public getTruckById(truckId: number): Observable<Truck> {
    const url = `${this.apiUrl}/${truckId}`;
    return this.http.get<Truck>(url).pipe(catchError(this.handleError));
  }

  public createTruck(truck: Truck): Observable<any> {
    return this.http
      .post(this.apiUrl, truck)
      .pipe(catchError(this.handleError));
  }

  public updateTruck(truck: Truck): Observable<any> {
    console.log(truck.id);

    const url = `${this.apiUrl}/${truck.id}`;
    return this.http.put(url, truck).pipe(catchError(this.handleError));
  }

  public deleteTruck(truckId: number): Observable<any> {
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
}
