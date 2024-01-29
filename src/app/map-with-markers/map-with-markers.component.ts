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
    '<div id="bodyContent">' +
    "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
    "sandstone rock formation in the southern part of the " +
    "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
    "south west of the nearest large town, Alice Springs; 450&#160;km " +
    "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
    "features of the Uluru - Kata Tjuta National Park. Uluru is " +
    "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
    "Aboriginal people of the area. It has many springs, waterholes, " +
    "rock caves and ancient paintings. Uluru is listed as a World " +
    "Heritage Site.</p>" +
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
    "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
    "(last visited June 22, 2009).</p>" +
    "</div>" +
    "</div>";

    const infoWindowOptions: google.maps.InfoWindowOptions = {
      maxWidth: 300,
      content: this.info,
      pixelOffset: new google.maps.Size(0, 100),
    };
    this.infoWindow.options = infoWindowOptions;

    this.infoWindow.open(marker, true);
  }

  public selectedMarker!: {
    name: string;
    address: string;
    email: string;
    phone: string;
    type: string;
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
        url: 'https://raw.githubusercontent.com/luis-olivetti/map-zoo-brusque/main/src/assets/zoo.kml',
        map: this.mapContainer.googleMap,
        clickable: false,
      });

      ctaLayer.setMap(this.mapContainer.googleMap);

      if (mapContainerElement) {
        mapContainerElement.style.height = (window.innerHeight * 0.8) + 'px';
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
