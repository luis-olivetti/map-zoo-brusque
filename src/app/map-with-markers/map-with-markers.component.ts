import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable, Subscription, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { MarkerService } from '../services/marker.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-with-markers',
  templateUrl: './map-with-markers.component.html',
  styleUrls: ['./map-with-markers.component.css'],
})
export class MapWithMarkersComponent implements OnInit, OnDestroy {
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;
  @ViewChild('mapContainer', { static: false }) mapContainer!: GoogleMap;

  public apiLoaded: Observable<boolean>;

  public info: string = '';

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094245073541256, lng: -48.92152550568243 },
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
      {
        elementType: 'geometry',
        stylers: [
          {
            color: '#C5F1DA',
          },
        ],
      },
    ],
  };

  public markerPositions: {
    position: google.maps.LatLngLiteral;
    name: string;
    description: string;
    options: google.maps.MarkerOptions;
  }[] = [];

  public handleMapDrag(): void {
    this.infoWindow.close();
  }

  public handleMarkerClick(markerPosition: any, marker: MapMarker): void {
    this.selectedMarker = markerPosition;

    this.info =
      '<div id="content">' +
      '<div id="siteNotice">' +
      "</div>" +
      '<h1 id="firstHeading" class="firstHeading">' + this.selectedMarker.name + '</h1>' +
      '<div id="bodyContent"><p>' + this.selectedMarker.description + '</p>' +
      "</div>" +
      "</div>";

    let pos = marker.getPosition();
    let height = 0;
    // if (pos) {
    //   // Se o infoWindow estiver muito próximo do topo da tela, ele será movido para baixo
    //   if (pos.lat() > -27.0941) {
    //     height = 300;
    //   }

    //   if (pos.lat() < -27.0948) {
    //     height = 0;
    //   }
    // }

    const infoWindowOptions: google.maps.InfoWindowOptions = {
      maxWidth: 300,
      content: this.info,
      pixelOffset: new google.maps.Size(0, height),
    };

    this.infoWindow.options = infoWindowOptions;
    this.infoWindow.open(marker, true);
  }

  public selectedMarker!: {
    name: string;
    description: string;
  };

  private markersSubscription!: Subscription;

  constructor(
    private httpClient: HttpClient,
    private markersService: MarkerService,
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
    this.markersSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.getMarkers();
  }

  onMapReady() {
    if (this.mapContainer.googleMap) {
      const mapContainerElement = this.mapContainer.googleMap?.getDiv();

      const ctaLayer = new google.maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/final.kml',
        map: this.mapContainer.googleMap,
        clickable: false,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      if (mapContainerElement) {
        mapContainerElement.style.height = (window.innerHeight - 58) + 'px';//(window.innerHeight * 0.8) + 'px';
        mapContainerElement.style.width = window.innerWidth + 'px';
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

  private getMarkers(): void {
    this.markersSubscription = this.markersService
      .getMarkers()
      .subscribe((trucks) => {
        this.markerPositions = trucks.map((truck) => ({
          position: {
            lat: truck.lat,
            lng: truck.lng,
          },
          name: truck.name,
          description: truck.description,
          options: {
            icon: {
              url: truck.icon,
            },
          },
        }));
      });
  }
}
