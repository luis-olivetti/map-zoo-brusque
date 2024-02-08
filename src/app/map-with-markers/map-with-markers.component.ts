import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  private centerMe: boolean = false;

  public optionsMap: google.maps.MapOptions = {
    center: { lat: -27.094245073541256, lng: -48.92152550568243 },
    zoom: 25,
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
    minZoom: 20,
    maxZoom: 30,
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
      '<h1 id="firstHeading" class="firstHeading">' + this.selectedMarker.name + '</h1>';

    if (this.selectedMarker.description && this.selectedMarker.description.length > 5) {
      this.info += '<div id="bodyContent"><p>' + this.selectedMarker.description + '</p>' +
        "</div>";
    }

    this.info += "</div>";

    const infoWindowOptions: google.maps.InfoWindowOptions = {
      maxWidth: 300,
      content: this.info,
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
      this.addCustomControl();

      this.mapContainer.googleMap.setZoom(25);

      const mapContainerElement = this.mapContainer.googleMap?.getDiv();

      const ctaLayer = new google.maps.KmlLayer({
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/final.kml',
        map: this.mapContainer.googleMap,
        clickable: false,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      const resizeMap = () => {
        if (mapContainerElement) {
          mapContainerElement.style.height = (window.innerHeight - 58) + 'px';
          mapContainerElement.style.width = window.innerWidth + 'px';
        }
      };

      window.addEventListener('resize', resizeMap);
      resizeMap();
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
      watchId = navigator.geolocation.watchPosition((pos) => {
        const me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);

        if (this.mapContainer.googleMap && this.centerMe) {
          this.mapContainer.googleMap.setCenter(me);
        }
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

  private addCustomControl() {
    const controlDiv = document.createElement('div');
    const controlUI = document.createElement('div');
    controlDiv.appendChild(controlUI);

    const controlImage = document.createElement('img');
    controlImage.src = 'assets/images/focus-out.png';
    controlImage.style.width = '48px';
    controlImage.style.height = '48px';
    controlImage.style.padding = '5px';
    controlUI.appendChild(controlImage);

    controlUI.addEventListener('click', () => {
      this.toggleCenterMe();
      controlImage.src = this.centerMe ? 'assets/images/focus-in.png' : 'assets/images/focus-out.png';
    });

    if (this.mapContainer.googleMap) {
      this.mapContainer.googleMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    }
  }

  private toggleCenterMe() {
    this.centerMe = !this.centerMe;
  }
}
