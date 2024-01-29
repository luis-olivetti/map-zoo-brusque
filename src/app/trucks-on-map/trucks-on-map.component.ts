import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { TruckService } from '../services/truck.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-trucks-on-map',
  templateUrl: './trucks-on-map.component.html',
  styleUrls: ['./trucks-on-map.component.css'],
})
export class TrucksOnMapComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('mapContainer', { static: false }) mapContainer!: GoogleMap;

  public streetViewLayer!: google.maps.StreetViewCoverageLayer;

  public apiLoaded: Observable<boolean>;

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094225, lng: -48.921469 },
    zoom: 19,
    streetViewControl: false,
    disableDefaultUI: true,
    restriction: {
      latLngBounds: {
        north: -27.093225,
        south: -27.095225,
        west: -48.924777834607745,
        east: -48.920469,
      },
      strictBounds: true,
    },
    styles: [
      {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }],
      },
    ],
  };

  public markerPositions: {
    position: google.maps.LatLngLiteral;
    name: string;
    address: string;
    email: string;
    phone: string;
    type: string;
    label: string;
    options: google.maps.MarkerOptions;
  }[] = [];

  public handleMarkerClick(markerPosition: any): void {
    this.selectedMarker = markerPosition;
  }

  public selectedMarker!: {
    name: string;
    address: string;
    email: string;
    phone: string;
    type: string;
  };

  private trucksSubscription!: Subscription;

  constructor(
    private httpClient: HttpClient,
    private trucksService: TruckService,
    private renderer: Renderer2
  ) {
    this.apiLoaded = this.httpClient
      .jsonp(
        `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsKey}`,
        'callback'
      )
      .pipe(
        mapTo(true),
        catchError(() => of(false))
      );
  }
  ngOnDestroy(): void {
    this.trucksSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getTrucks();
  }

  onMapReady() {
    this.streetViewLayer = new google.maps.StreetViewCoverageLayer();
    if (this.mapContainer.googleMap) {
      const mapContainerElement = this.mapContainer.googleMap?.getDiv();

      const ctaLayer = new google.maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/zoo.kml',
        map: this.mapContainer.googleMap,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      if (mapContainerElement) {
        if (this.isMobile()) {
          mapContainerElement.style.height = '300px';
          mapContainerElement.style.width = '400px';
        } else {
          mapContainerElement.style.height = '600px';
          mapContainerElement.style.width = '1000px';
        }
      }
    } else {
      console.log('streetViewLayer not set');
    }

    var myloc = new google.maps.Marker({
      clickable: false,
      zIndex: 999,
      map: this.mapContainer.googleMap,
      icon: {
        url: "assets/images/guy.png",
      }
    });

    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(function (pos) {
        const me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);
      }, (error) => {
        console.log(error);
      }, {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      });
    } else {
      alert("Geolocalização não suportada neste navegador.");
    }
  }

  private getTrucks(): void {
    this.trucksSubscription = this.trucksService
      .getTrucks()
      .subscribe((trucks) => {
        this.markerPositions = trucks.map((truck) => ({
          position: {
            lat: truck.lat,
            lng: truck.lng,
          },
          name: truck.name,
          address: truck.address,
          email: truck.email,
          phone: truck.phone,
          type: truck.type,
          label: truck.label,
          options: {
            icon: {
              url: truck.icon,
            },
          },
        }));
      });
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768; // Defina um ponto de quebra adequado para dispositivos móveis
  }
}
